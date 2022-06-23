import { Expression, LiteralExpression } from './expressions';

export interface Statement {
  type: 'Statement';
  subtype: string;
}

export interface AssignmentStatement extends Statement {
  subtype: 'AssignmentStatement';
  left: string;
  right: Expression;
}

export interface ReturnStatement extends Statement {
  subtype: 'ReturnStatement';
  value: Expression;
}

export interface FunctionStatement extends Statement {
  subtype: 'FunctionStatement';
  name: string;
  arguments: string[];
  body: Statement[];
  returnStatement?: ReturnStatement;
}

export interface StructStatement extends Statement {
  subtype: 'StructStatement';
  name: string;
  fields: string[];
}

export interface IfStatement extends Statement {
  subtype: 'IfStatement';
  condition: Expression;
  body: Statement[];
  if_elif_else: 'if'|'elif'|'else';
}

export interface WhileStatement extends Statement {
  subtype: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

export interface ForStatement extends Statement {
  subtype: 'ForStatement';
  init: AssignmentStatement;
  condition: Expression;
  increment: AssignmentStatement;
  body: Statement[];
  
}

export class StatementFactory {
  static createForStatement(init: AssignmentStatement, condition: Expression, increment: AssignmentStatement, body: Statement[]): ForStatement {
    return {
      type: 'Statement',
      subtype: 'ForStatement',
      init,
      condition,
      increment,
      body
    };
  }

  static createWhileStatement(expr: Expression, block: Statement[]): WhileStatement {
    return {
      type: 'Statement',
      subtype: 'WhileStatement',
      condition: expr,
      body: block
    }; 
  }
  static createIfStatement(condition: Expression, body: Statement[], is_elif: boolean): IfStatement {
    return {
      type: 'Statement',
      subtype: 'IfStatement',
      condition: condition,
      if_elif_else: is_elif ? 'elif' : 'if',
      body,
    };
  }

  static createElseStatement(body: Statement[]): IfStatement {
    return {
      type: 'Statement',
      subtype: 'IfStatement',
      body,
      if_elif_else: 'else',
      condition: <LiteralExpression>{
        type: 'Expression',
        subtype: 'LiteralExpression',
        value: 'true'
      }
    };
  }
 
  static createAssignmentStatement(left: string, right: Expression): AssignmentStatement {
    return {
      type: 'Statement',
      subtype: 'AssignmentStatement',
      left: left,
      right: right
    };
  }

  static createReturnStatement(value: Expression): ReturnStatement {
    return {
      type: 'Statement',
      subtype: 'ReturnStatement',
      value: value
    };
  }

  static createFunctionStatement(name: string, args: string[], body: Statement[]): FunctionStatement {
    return {
      type: 'Statement',
      subtype: 'FunctionStatement',
      name: name,
      arguments: args,
      body: body
    };
  }

  static createStructStatement(name: string, fields: string[]): StructStatement {
    return {
      type: 'Statement',
      subtype: 'StructStatement',
      name: name,
      fields: fields
    };
  }
}