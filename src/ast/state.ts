import { StructStatement, FunctionStatement } from './statements';

export class State {
  constructor(
    public variables: { [key: string]: any; },
    public functions: { [key: string]: FunctionStatement; },
    public structs: { [key: string]: StructStatement; }
  ) { }

  static createState(
    variables: { [key: string]: any; } = {}, 
    functions: { [key: string]: FunctionStatement; } = {}, 
    structs: { [key: string]: StructStatement; } = {}
  ): State {
    return new State(variables, functions, structs);
  }
}
