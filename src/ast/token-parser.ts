import { TokenStream } from './token-stream';
import { match, Token } from "./token";
import { AssignmentStatement, Statement, StatementFactory } from './statements';
import { Expression, ExpressionFactory } from './expressions';
import { PeekIterator } from '../util/peek-iterator';

export function takeTokensUntil(token_generator: Iterator<Token>, token_type: string, token_subtype?: string): Token[] {
  // get all tokens until we encounter a semicolon token
  const tokens = [];
  while (true) {
    const next_token = token_generator.next().value;
    if (next_token.type === token_type && (token_subtype === undefined || next_token.value === token_subtype)) {
      break;
    }
    tokens.push(next_token);
  }

  return tokens;
}

export class TokenParser {
  constructor (private token_stream: TokenStream) {}

  generateProgramMainAST(): Statement[] {
    // generator from tokens array
    const token_stream = this.token_stream.next();
    const token_generator = new PeekIterator((function* () {
      yield  { type: 'reserved', value: 'function' };
      yield  { type: 'identifier', value: '__main__' };
      yield  { type: 'syntax', value: '(' };
      yield  { type: 'syntax', value: ')' };
      yield  { type: 'syntax', value: '{' };
      yield* token_stream;
      yield { type: 'reserved', value: 'return' };
      yield { type: 'number_literal', value: '0' };
      yield { type: 'semicolon' };
      yield { type: 'syntax', value: '}' };
      yield { type: 'eof' };
    })());

    const statements: Statement[] = [];
    while (token_generator.peek()?.type !== 'eof') {
      const next_statement = TokenParser.tryBuildStatement(token_generator);
      statements.push(next_statement);
    }

    return statements;
  }

  static tryBuildStatement(token_stream: PeekIterator<Token>): Statement {
    // it should handle block statements: { (build a block of statements, ending with a return statement) }
    // it should handle return statements: RETURN (try to build a non-terminal expression) ;
    // it should handle if statements: IF (try to build a non-terminal expression) { (build a block of statements, ending with a return statement) }
    // it should handle while statements: WHILE (try to build a non-terminal expression) { (build a block of statements, ending with a return statement) }
    // it should handle for statements: FOR (try to build a non-terminal expression) { (build a block of statements, ending with a return statement) }

    const next_token = token_stream.next().value;
    switch (match(next_token)) {
      case match({ type: 'reserved', value: 'function' }):
        return TokenParser.tryBuildFunctionStatement(token_stream);
      case match({ type: 'reserved', value: 'return' }):
        return TokenParser.tryBuildReturnStatement(token_stream);
      case match({ type: 'reserved', value: 'if' }):
      case match({ type: 'reserved', value: 'elif' }):
        return TokenParser.tryBuildIfStatement(token_stream, next_token.value === 'elif');
      case match({ type: 'reserved', value: 'else' }):
        return TokenParser.tryBuildElseStatement(token_stream);
      case match({ type: 'reserved', value: 'while' }):
        return TokenParser.tryBuildWhileStatement(token_stream);
      case match({ type: 'reserved', value: 'for' }):
        return TokenParser.tryBuildForStatement(token_stream);
      case match({ type: 'reserved', value: 'let' }):
        return TokenParser.tryBuildAssignmentStatement(token_stream);
      default:
        throw new Error(`Unexpected token: (type=${next_token.type}, value=${next_token.value})`);
    }
  }

  static tryBuildAssignmentStatement(token_stream: PeekIterator<Token>): AssignmentStatement {
    const identifier = token_stream.next().value;
    const expected_equality_token = token_stream.next().value;
    if (expected_equality_token.type !== 'syntax' && expected_equality_token.value !== '=') {
      throw new Error(`Expected '='`);
    }
    const expr = TokenParser.tryBuildExpression(new PeekIterator(token_stream));
    if (token_stream.next().value.type !== 'semicolon') {
      throw new Error(`Expected ';'`);
    }
    return StatementFactory.createAssignmentStatement(identifier, expr);
  }

  static tryBuildForStatement(token_stream: PeekIterator<Token>): Statement {
    if (token_stream.next().value.type !== 'syntax' || token_stream.next().value.value !== '(') {
      throw new Error('Expected (');
    }
    const initializer_expression = TokenParser.tryBuildAssignmentStatement(token_stream);
    const condition_expression = TokenParser.tryBuildExpression(new PeekIterator(token_stream));
    if (token_stream.next().value.type !== 'syntax' || token_stream.next().value.value !== ';') {
      throw new Error('Expected ;');
    }
    const increment_statement = TokenParser.tryBuildAssignmentStatement(new PeekIterator(token_stream));
    if (token_stream.next().value.type !== 'syntax' || token_stream.next().value.value !== ')') {
      throw new Error('Expected )');
    }
    const block = TokenParser.tryBuildBlock(token_stream);
    return StatementFactory.createForStatement(initializer_expression, condition_expression, increment_statement, block);
  }

  static tryBuildWhileStatement(token_stream: PeekIterator<Token>): Statement {
    const expr = TokenParser.tryBuildExpression(new PeekIterator(token_stream));
    const block = TokenParser.tryBuildBlock(token_stream);
    return StatementFactory.createWhileStatement(expr, block);
  }

  static tryBuildBlock(token_stream: PeekIterator<Token>): Statement[] {
    if (token_stream.next().value.type !== 'syntax' || token_stream.next().value.value !== '{') {
      throw new Error('Expected {');
    }
    const statements: Statement[] = [];
    while (token_stream.next().value.type !== 'syntax' || token_stream.next().value.value !== '}') {
      const next_statement = TokenParser.tryBuildStatement(token_stream);
      statements.push(next_statement);
    }

    return statements;
  }

  static tryBuildIfStatement(token_stream: PeekIterator<Token>, is_elif: boolean = false): Statement {
    const expr = TokenParser.tryBuildExpression(new PeekIterator(token_stream));
    const block = TokenParser.tryBuildBlock(token_stream);
    return StatementFactory.createIfStatement(expr, block, is_elif);
  }

  static tryBuildElseStatement(token_stream: PeekIterator<Token>): Statement {
    const block = TokenParser.tryBuildBlock(token_stream);
    return StatementFactory.createElseStatement(block);
  }

  static tryBuildReturnStatement(token_stream: PeekIterator<Token>): Statement {
    const expr = TokenParser.tryBuildExpression(new PeekIterator(token_stream));
    return StatementFactory.createReturnStatement(expr);
  }

  static tryBuildFunctionStatement(token_stream: PeekIterator<Token>): Statement {
    const function_name: string = token_stream.next().value.value!;
    const expected_opening_paren = token_stream.next().value;
    if (expected_opening_paren.type !== 'syntax' || expected_opening_paren.value !== '(') {
      throw new Error('Expected (');
    }
    const function_params: string[] = TokenParser.getParamIdentifiers(takeTokensUntil(token_stream, 'syntax', ')'));
    const function_body: Statement[] = [];
    if (token_stream.next().value.value !== '{') {
      throw new Error('Expected {');
    }
    while (true) {
      const next_statement = this.tryBuildStatement(token_stream);
      function_body.push(next_statement);
      if (next_statement.subtype === 'ReturnStatement') {
        break;
      }
    }
    if (token_stream.next().value.value !== '}') {
      throw new Error('Expected }');
    }
    return StatementFactory.createFunctionStatement(function_name, function_params, function_body);
  }

  static tryBuildExpression(tokens: PeekIterator<Token>): Expression {
    // it should handle string literals
    // it should handle numbers
    // it should handle function calls
    // it should handle identifiers
    // it should handle PAREN expression wraps
    // it should handle +-*/^ && ||
    const next_token = tokens.next().value;
    switch (next_token.type) {
      case 'string_literal':
      case 'number_literal':
        return ExpressionFactory.createLiteralExpression(next_token.value!);
      case 'identifier':
        const peek_next_token = tokens.peek()!;
        if (peek_next_token.type === 'syntax' && peek_next_token.value === '(') {
          return TokenParser.tryBuildFunctionCallExpression(next_token.value, tokens);
        }
        return ExpressionFactory.createIdentifierExpression(tokens.next().value.value!);
      case 'syntax': {
        if (next_token.value === '(') {
          const expression = TokenParser.tryBuildExpression(tokens);
          if (tokens.next().value.value !== ')') {
            throw new Error('Expected )');
          }
          return expression;
        }
        return ExpressionFactory.createBinaryExpression(
          ExpressionFactory.getBinaryExpressionOperator(next_token.value),
          TokenParser.tryBuildExpression(tokens),
          TokenParser.tryBuildExpression(tokens)
        );
      }
      default:
        throw new Error('unimplemented');
    }
  }

  static tryBuildFunctionCallExpression(function_name: string, tokens: PeekIterator<Token>): Expression {
    // precondition: tokens.peek().value !== '(', because we already drained that symbol to get here
    const function_params: Expression[] = [];
    while (tokens.peek()?.value !== ')') {
      function_params.push(TokenParser.tryBuildExpression(tokens));
      if (tokens.peek()?.value === ',') {
        tokens.next();
      }
    }
    tokens.next();
    return ExpressionFactory.createFunctionCallExpression(function_name, function_params);
  }

  static getParamIdentifiers(tokens: Token[]): string[] {
    const param_identifiers: string[] = [];
    for (const token of tokens) {
      if (token.type === 'identifier') {
        param_identifiers.push(token.value!);
      }
    }
    return param_identifiers;
  }
}
