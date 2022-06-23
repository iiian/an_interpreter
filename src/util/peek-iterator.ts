// An implementation of iterator that supports next but also supports peek.
// This is useful for parsing tokens.
// Peek will look forward at the next token, but not consume it.
export class PeekIterator<T> implements Iterator<T> {
  private _peeked: T | undefined;
  constructor(private _iterator: Iterator<T>) {}

  next(): IteratorResult<T> {
    if (this._peeked !== undefined) {
      const result = this._peeked;
      this._peeked = undefined;
      return { value: result, done: false };
    }
    return this._iterator.next();
  }

  peek(): T | undefined {
    if (this._peeked !== undefined) {
      return this._peeked;
    }
    const result = this._iterator.next();
    if (result.done) {
      return undefined;
    }
    this._peeked = result.value;
    return this._peeked;
  }
}

// An implementation of an iterator that supports peeking ahead multiple tokens.
export class NPeekIterator<T> implements Iterator<T> {
  private _peeked: T[] = [];
  constructor(private _iterator: Iterator<T>) {}

  next(): IteratorResult<T> {
    if (this._peeked.length > 0) {
      const result = this._peeked.shift()!;
      return { value: result, done: false };
    }
    return this._iterator.next();
  }

  peek(n: number): T[] {
    while (this._peeked.length < n) {
      const result = this._iterator.next();
      if (result.done) {
        break;
      }
      this._peeked.push(result.value);
    }
    return this._peeked;
  }
}