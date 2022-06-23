import { Expression, FunctionCallExpression } from './expressions';
import { ExpressionEvaluator } from './expression-evaluator';
import { State } from './state';
import { Statement, AssignmentStatement, FunctionStatement, StructStatement } from './statements';
/**
 * An interpreter that evaluates a stream of statements, containing expressions,
 * and updates a program state based on those statements
 */
export class FnInterpreter {
  static interpret(statements: Statement[], state: State): any {
    let return_value: any;
    for (const statement of statements) {
      return_value = FnInterpreter.interpretStatement(statement, state);
    }
    return return_value;
  }

  static interpretStatement(statement: Statement, state: State): any {
    switch (statement.subtype) {
      case 'AssignmentStatement':
        const assigment = statement as AssignmentStatement;
        state.variables[assigment.left] = FnInterpreter.evaluate(assigment.right, state);
        break;
      case 'ReturnStatement':
        const return_stmt = statement as AssignmentStatement;
        return FnInterpreter.evaluate(return_stmt.right, state);
      case 'FunctionStatement':
        const func_stmt = statement as FunctionStatement;
        state.functions[func_stmt.name] = func_stmt;
        break;
      case 'StructStatement':
        const struct_stmt = statement as StructStatement;
        state.structs[struct_stmt.name] = struct_stmt;
        break;
      default:
        throw new Error(`Unknown statement type: ${statement.subtype}`);
    }
    return;
  }

  static evaluate(expression: Expression, state: State): any {
    switch (expression.subtype) {
      case 'FunctionCallExpression':
        const func_call = expression as FunctionCallExpression;
        const func = state.functions[func_call.name];
        const vars = func.arguments.reduce((acc, arg_name, index) => {
          acc[arg_name] = FnInterpreter.evaluate(func_call.arguments[index], state);
          return acc;
        }, {} as { [key: string]: any });
        return FnInterpreter.interpret(
          state.functions[func_call.name].body, 
          State.createState(vars, state.functions, state.structs)
        );
      default:
        return ExpressionEvaluator.evaluate(expression, state);
    }
  }
}
