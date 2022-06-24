import { Expression, FunctionCallExpression } from './expressions';
import { ExpressionEvaluator } from './expression-evaluator';
import { State } from './state';
import { Statement, AssignmentStatement, FunctionStatement, StructStatement, ReturnStatement, ForStatement, WhileStatement, IfStatement, IfElifElseBlockStatement } from './statements';
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
        state.setVariable(assigment.left, FnInterpreter.evaluate(assigment.right, state));
        break;
      case 'ReturnStatement':
        const return_stmt = statement as ReturnStatement;
        return FnInterpreter.evaluate(return_stmt.value, state);
      case 'FunctionStatement':
        const func_stmt = statement as FunctionStatement;
        state.setFunction(func_stmt.name, func_stmt);
        break;
      case 'StructStatement':
        const struct_stmt = statement as StructStatement;
        state.setStruct(struct_stmt.name, struct_stmt);
        break;
      case 'IfElifElseBlockStatement':
        const { branches } = statement as IfElifElseBlockStatement;
        for (const branch of branches) {
          if (FnInterpreter.evaluate(branch.condition, state)) {
            FnInterpreter.interpret(branch.body, state);
            break;
          }
        }
        break;
      case 'ForStatement':
        const { init, condition, increment, body } = statement as ForStatement;
        const scope_state = State.spawn(state);
        FnInterpreter.interpretStatement(init, scope_state);
        while (FnInterpreter.evaluate(condition, scope_state)) {
          FnInterpreter.interpret(body, scope_state);
          FnInterpreter.interpretStatement(increment, scope_state);
        }
        break;
      case 'WhileStatement':
        const { condition: while_condition, body: while_body } = statement as WhileStatement;
        const while_scope_state = State.spawn(state);
        while (FnInterpreter.evaluate(while_condition, while_scope_state)) {
          FnInterpreter.interpret(while_body, while_scope_state);
        }
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
