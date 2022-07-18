import { StringTokenStream } from '../../ast/token-stream';
import { Token } from "../../ast/token";

function syntaxTokenFrom(value: string) {
  return <Token>{
    type: 'syntax',
    value
  };
}

function reservedTokenFrom(value: string) {
  return <Token>{
    type: 'reserved',
    value
  };
}

describe('StringTokenStream', () => {
  describe('*next', () => {
    it('should generate a stream of tokens', () => {
      const stream = new StringTokenStream('let x = 2;');
      const tokens = [...stream.next()];
      expect(tokens).toEqual(<Token[]>[
        {
          type: 'reserved',
          value: 'let',
        },
        {
          type: 'identifier',
          value: 'x'
        },
        {
          type: 'syntax',
          value: '='
        },
        {
          type: 'number_literal',
          value: '2'
        },
        {
          type: 'semicolon'
        },
      ]);
    });
    it('should generate a stream of tokens including numbers and semicolons', () => {
      const stream = new StringTokenStream('38.05682 2.8;');
      const tokens = [...stream.next()];
      expect(tokens).toEqual([
        {
          type: 'number_literal',
          value: '38.05682'
        },
        {
          type: 'number_literal',
          value: '2.8'
        },
        {
          type: 'semicolon'
        },
      ]);
    });
    it('should generate a stream of tokens including reserved words', () => {
      const stream = new StringTokenStream('return let struct function for while if else if else');
      const tokens = [...stream.next()];
      expect(tokens).toEqual([
        {
          type: 'reserved',
          value: 'return'
        },
        {
          type: 'reserved',
          value: 'let'
        },
        {
          type: 'reserved',
          value: 'struct'
        },
        {
          type: 'reserved',
          value: 'function'
        },
        reservedTokenFrom('for'),
        reservedTokenFrom('while'),
        reservedTokenFrom('if'),
        reservedTokenFrom('elif'),
        reservedTokenFrom('else'),
      ]);
    });
    it('should generate a stream of tokens including identifiers', () => {
      const stream = new StringTokenStream('x foo2 good_names_are_hard _underscores_r_us');
      const tokens = [...stream.next()];
      expect(tokens).toEqual([
        { 
          type: 'identifier',
          value: 'x',
        },
        { 
          type: 'identifier',
          value: 'foo2',
        },
        { 
          type: 'identifier',
          value: 'good_names_are_hard',
        },
        { 
          type: 'identifier',
          value: '_underscores_r_us',
        }
      ]);
    });
    it('should generate a stream of tokens including syntax', () => {
      const stream = new StringTokenStream('= , + - / * ! ( ) [ ] . { } ;');
      const tokens = [...stream.next()];
      expect(tokens).toEqual([
        syntaxTokenFrom('='),
        syntaxTokenFrom(','),
        syntaxTokenFrom('+'),
        syntaxTokenFrom('-'),
        syntaxTokenFrom('/'),
        syntaxTokenFrom('*'),
        syntaxTokenFrom('!'),
        syntaxTokenFrom('('),
        syntaxTokenFrom(')'),
        syntaxTokenFrom('['),
        syntaxTokenFrom(']'),
        syntaxTokenFrom('.'),
        syntaxTokenFrom('{'),
        syntaxTokenFrom('}'),
        { type: 'semicolon', },
      ]);
    });
    it('should generate a stream of tokens including string literals', () => {
      const stream = new StringTokenStream('"Hello world!"');
      const tokens = [...stream.next()];
      expect(tokens).toEqual([
        {
          type: 'string_literal',
          value: 'Hello world!'
        }
      ])
    });
    it('should generate a stream of tokens for function definitions', () => {
      const stream = new StringTokenStream('function foo(x, y) { return x + y; }');
      const tokens = [...stream.next()];
      expect(tokens).toEqual([
        { type: 'reserved', value: 'function' },
        { type: 'identifier', value: 'foo' },
        { type: 'syntax', value: '(' },
        { type: 'identifier', value: 'x' },
        { type: 'syntax', value: ',' },
        { type: 'identifier', value: 'y' },
        { type: 'syntax', value: ')' },
        { type: 'syntax', value: '{' },
        { type: 'reserved', value: 'return' },
        { type: 'identifier', value: 'x' },
        { type: 'syntax', value: '+' },
        { type: 'identifier', value: 'y' },
        { type: 'semicolon' },
        { type: 'syntax', value: '}' },
      ]);
    });
  });
});
