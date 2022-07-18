export interface Expression {
  type: 'Expression';
  subtype: string;
}

export interface LiteralExpression extends Expression {
  subtype: 'NumberLiteralExpression'|'StringLiteralExpression'|'BooleanLiteralExpression';
  value: string;
}

export interface IdentifierExpression extends Expression {
  subtype: 'IdentifierExpression';
  name: string;
}

export interface PropertyAccessExpression extends Expression {
  subtype: 'PropertyAccessExpression';
  object: Expression;
  property: string;
}

export interface FunctionCallExpression extends Expression {
  subtype: 'FunctionCallExpression';
  name: string;
  arguments: Expression[];
}

export type BinaryOperators = 'AND' | 'OR' | 'EQUAL' | 'NOT_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE' | 'MODULO' | 'POWER';

export interface InfixExpression extends Expression {
  subtype: 'InfixExpression';
  left: Expression;
  right: Expression;
  operator: BinaryOperators;
}

export interface UnaryExpression extends Expression {
  subtype: 'UnaryExpression';
  operator: 'NOT' | 'NEGATE';
  operand: Expression;
}

export class ExpressionFactory {
  static createLiteralExpression(value: string, type: 'StringLiteralExpression'|'NumberLiteralExpression'|'BooleanLiteralExpression'): LiteralExpression {
    return {
      type: 'Expression',
      subtype: type,
      value: value
    };
  }

  static createIdentifierExpression(name: string): IdentifierExpression {
    return {
      type: 'Expression',
      subtype: 'IdentifierExpression',
      name: name
    };
  }

  static createFunctionCallExpression(name: string, args: Expression[]): FunctionCallExpression {
    return {
      type: 'Expression',
      subtype: 'FunctionCallExpression',
      name: name,
      arguments: args
    };
  }

  static createBinaryExpression(operator: BinaryOperators, left: Expression, right: Expression): InfixExpression {
    return {
      type: 'Expression',
      subtype: 'InfixExpression',
      left: left,
      right: right,
      operator: operator
    };
  }

  static getBinaryExpressionOperator(key: string): BinaryOperators {
    switch (key) {
      case '+':
        return 'ADD';
      case '-':
        return 'SUBTRACT';
      case '*':
        return 'MULTIPLY';
      case '/':
        return 'DIVIDE';
      case '%':
        return 'MODULO';
      case '^':
        return 'POWER';
      case '==':
        return 'EQUAL';
      case '!=':
        return 'NOT_EQUAL';
      case '<':
        return 'LESS_THAN';
      case '<=':
        return 'LESS_THAN_OR_EQUAL';
      case '>':
        return 'GREATER_THAN';
      case '>=':
        return 'GREATER_THAN_OR_EQUAL';
      case '&&':
        return 'AND';
      case '||':
        return 'OR';
      default:
        throw new Error(`Unknown binary operator: ${key}`);
    }
  }
}