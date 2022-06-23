import { Expression, IdentifierExpression, InfixExpression, LiteralExpression, PropertyAccessExpression } from './expressions';
import { State } from './state';

export class ExpressionEvaluator {
  static evaluate(expression: Expression, state: State): any {
    switch (expression.subtype) {
      case 'LiteralExpression':
        const lit_expr = expression as LiteralExpression;
        return lit_expr.value;
      case 'IdentifierExpression':
        const var_expr = expression as IdentifierExpression;
        return state.variables[var_expr.name];
      case 'FunctionCallExpression':
        throw new Error('Function calls are meant to be analyzed by the interpreter');
      case 'UnaryExpression':
        const un_expr = expression as InfixExpression;
        const operand = ExpressionEvaluator.evaluate(un_expr.left, state);
        return !operand;
      case 'PropertyAccessExpression':
        const prop_expr = expression as PropertyAccessExpression;
        const object = ExpressionEvaluator.evaluate(prop_expr.object, state);
        return object[prop_expr.property];
      case 'InfixExpression':
        const bin_expr = expression as InfixExpression;
        const left = ExpressionEvaluator.evaluate(bin_expr.left, state);
        const right = ExpressionEvaluator.evaluate(bin_expr.right, state);
        switch (bin_expr.operator) {
          case 'ADD':
            return left + right;
          case 'SUBTRACT':
            return left - right;
          case 'MULTIPLY':
            return left * right;
          case 'DIVIDE':
            return left / right;
          case 'POWER':
            return Math.pow(left, right);
          case 'MODULO':
            return left % right;
          case 'EQUAL':
            return left === right;
          case 'NOT_EQUAL':
            return left !== right;
          case 'LESS_THAN':
            return left < right;
          case 'LESS_THAN_OR_EQUAL':
            return left <= right;
          case 'GREATER_THAN':
            return left > right;
          case 'GREATER_THAN_OR_EQUAL':
            return left >= right;
          case 'AND':
            return left && right;
          case 'OR':
            return left || right;
        }
      default:
        throw new Error(`Unknown expression type: ${expression.subtype}`);
    }
  }
}
