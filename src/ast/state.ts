import { StructStatement, FunctionStatement } from './statements';

export class State {
  constructor(
    public variables: { [key: string]: any; } = {},
    public functions: { [key: string]: FunctionStatement; } = {},
    public structs: { [key: string]: StructStatement; } = {},
    public parent?: State
  ) { }

  public hasVariable(key: string): boolean {
    return this.parent?.hasVariable(key) || this.variables.hasOwnProperty(key);
  }

  public getVariable(key: string): any {
    if (this.variables.hasOwnProperty(key)) {
      return this.variables[key];
    }
    if (this.parent) {
      return this.parent.getVariable(key);
    }

    throw new Error(`Variable ${key} not found`);
  }

  public setVariable(key: string, value: any): void {
    if (this.parent?.hasVariable(key)) {
      this.parent.setVariable(key, value);
      return;
    }
    this.variables[key] = value;
  }

  public getFunction(key: string): FunctionStatement {
    if (this.functions.hasOwnProperty(key)) {
      return this.functions[key];
    }
    if (this.parent) {
      return this.parent.getFunction(key);
    }

    throw new Error(`Function ${key} not found`);
  }

  public setFunction(key: string, value: FunctionStatement): void {
    this.functions[key] = value;
  }

  public getStruct(key: string): StructStatement {
    if (this.structs.hasOwnProperty(key)) {
      return this.structs[key];
    }
    if (this.parent) {
      return this.parent.getStruct(key);
    }
    throw new Error(`Struct ${key} not found`);
  }

  public setStruct(key: string, value: StructStatement): void {
    this.structs[key] = value;
  }

  static createState(
    variables: { [key: string]: any; } = {}, 
    functions: { [key: string]: FunctionStatement; } = {}, 
    structs: { [key: string]: StructStatement; } = {}
  ): State {
    return new State(variables, functions, structs);
  }

  static spawn(state: State): State {
    return new State({},{},{}, state);
  }
}
