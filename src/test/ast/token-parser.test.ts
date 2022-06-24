import { StringTokenStream } from '../../ast/token-stream';
import { TokenParser } from '../../ast/token-parser';
import { FnInterpreter } from '../../ast/interpreter';
import { State } from '../../ast/state';
describe('TokenParser', () => {
  describe('generateAST', () => {
    it('should handle assignment statements', () => {
      //: LET id = (try to build a non-terminal expression) ;
      const token_stream = new StringTokenStream('let x = (* (+ 3 8) 4);');
      const token_parser = new TokenParser(token_stream);
      const body = token_parser.generateProgramMainAST();
      const state = State.createState();
      FnInterpreter.interpret(body, state);
      expect(state.variables['x']).toBe(44);
    });
    it('should handle function definition statements, and by extension return statements', () => {
      //: FUNCTION id ( ...id[] `Params` ) { (build a block of statements, ending with a return statement) }
      const token_stream = new StringTokenStream(`
        function square(x) {
          return * x x;
        }

        let j = square(3);
      `);
      const token_parser = new TokenParser(token_stream);
      const body = token_parser.generateProgramMainAST();
      const state = State.createState();
      FnInterpreter.interpret(body, state);
      expect(state.variables['j']).toBe(9);
    });
    // it('should handle struct definition statements', () => {
    //   //: STRUCT id { (build a block of id )}
    //   const token_stream = new StringTokenStream(`
    //     struct Point {
    //       x: number;
    //       y: number;
    //     }
    //   `);
    //   const token_parser = new TokenParser(token_stream);
    //   const body = token_parser.generateAST();
    //   const state = State.createState();
    //   FnInterpreter.interpret(body, state);
    //   expect(state.structs['Point']).toBeDefined();
    // });
    it('should handle for loops', () => {
      const token_stream = new StringTokenStream(`
        let x = 0;
        for (let i = 0; < i 10; let i = + i 1;) {
          let x = + x i;
        }
      `);
      const token_parser = new TokenParser(token_stream);
      const body = token_parser.generateProgramMainAST();
      const state = State.createState();
      FnInterpreter.interpret(body, state);
      expect(state.variables['x']).toBe(45);
    });
    it('should handle if statements', () => {
      const token_stream = new StringTokenStream(`
        let x = 0;
        if (> x 0) {
          let x = + x 1;
        }
        else if (< x 0) {
          let x = - x 2;
        }
        else {
          let x = - x 1;
        }
      `);
      const token_parser = new TokenParser(token_stream);
      const body = token_parser.generateProgramMainAST();
      const state = State.createState();
      FnInterpreter.interpret(body, state);
      expect(state.variables['x']).toBe(-1);
    });
    it('should handle while loops', () => {
      const token_stream = new StringTokenStream(`
        let x = 0;
        while (< x 10) {
          let x = + x 1;
        }
      `);
      const token_parser = new TokenParser(token_stream);
      const body = token_parser.generateProgramMainAST();
      const state = State.createState();
      FnInterpreter.interpret(body, state);
      expect(state.variables['x']).toBe(10);
    });
  });
});