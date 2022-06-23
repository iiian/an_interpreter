import { Token } from './token';

export interface TokenStream {
  next(): Generator<Token>;
  eof(): boolean;
}

export class StringTokenStream implements TokenStream {
  private pos: number = 0;
  public constructor(private str: string) {}

  *next() {
    while (!this.eof()) { 
      // it could be a:
      // a number literal: \d(\.\d+)?
      // syntax: = , + - / * != ( ) [ ] . { } ;
      // reserve word: let, function, return, struct
      // an identifier: \w[_\w\d]+
      // a string recontextualizer: \"[~\n]\"
      let next_token = this.str[this.pos];
      // throw out generic whitespace
      if (next_token === ' ' || next_token === '\t' || next_token === '\n') { 
        this.pos++;
      }
      // throw out comments
      else if (next_token === '/' && this.str[this.pos+1] === '/') {
        while (this.str[this.pos] !== '\n') { this.pos++ }
        this.pos++;
      }
      else if (next_token === ';') {
        yield <Token>{
          type: 'semicolon'
        };
        this.pos++;
      }
      else if (Number.isInteger(Number(next_token))) {
        yield* this.handleNumber();
      }
      else if (['<', '>', '!','=',',','+','-','/','*','^','[',']','(',')','{','}','.'].includes(this.str[this.pos])) {
        yield <Token>{
          type: 'syntax',
          value: next_token
        };
        this.pos++;
      }
      else if (next_token === '"') {
        this.pos++;
        let next_end = this.pos;
        while (this.str[next_end] !== '"') { next_end++; }
        yield {
          type: 'string_literal',
          value: this.str.slice(this.pos, next_end)
        }
        this.pos = next_end+1;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'let')) {
        yield {
          type: 'reserved',
          value: 'let'
        };
        this.pos += 'let'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'function')) {
        yield {
          type: 'reserved',
          value: 'function'
        };
        this.pos += 'function'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'struct')) {
        yield {
          type: 'reserved',
          value: 'struct'
        }
        this.pos += 'struct'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'return')) {
        yield {
          type: 'reserved',
          value: 'return'
        };
        this.pos += 'return'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'for')) {
        yield {
          type: 'reserved',
          value: 'for'
        };
        this.pos += 'for'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'while')) {
        yield {
          type: 'reserved',
          value: 'while'
        };
        this.pos += 'while'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'if')) {
        yield {
          type: 'reserved',
          value: 'if'
        };
        this.pos += 'if'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'else if')) {
        yield {
          type: 'reserved',
          value: 'elif'
        };
        this.pos += 'else if'.length;
      }
      else if (StringTokenStream.sliceEquals(this.str, this.pos, 'else')) {
        yield {
          type: 'reserved',
          value: 'else'
        };
        this.pos += 'else'.length;
      }
      else if (/[_\w]/.test(next_token)) {
        let next_end = this.pos;
        while (next_end <= this.str.length && /[_\w\d]/.test(this.str[next_end++])) {}
        yield {
          type: 'identifier',
          value: this.str.slice(this.pos, next_end-1)
        };
        this.pos = next_end;
      }
      else {
        throw new Error('unexpected untokenizable text encountered: ' + this.str.slice(this.pos, this.pos+10));
      }
    }
  }

  static sliceEquals(haystack: string, start: number, comparand: string): boolean {
    return haystack.slice(start, start+comparand.length) === comparand;
  }

  private *handleNumber() {
    let next_end = this.pos;
    let left_of_decimal = false;
    if (this.str[next_end + 1] === '.') {
      next_end++;
      left_of_decimal = true;
    }
    while (Number.isInteger(parseInt(this.str[next_end + 1])) ||
      (!left_of_decimal && this.str[next_end + 1] === '.')) {
      next_end++;
      if (this.str[next_end] === '.') {
        left_of_decimal === true;
      }
    }
    yield <Token>{
      type: 'number_literal',
      value: this.str.slice(this.pos, next_end + 1)
    };
    this.pos = next_end + 1;
  }

  eof(): boolean {
    return this.pos >= this.str.length;
  }
}