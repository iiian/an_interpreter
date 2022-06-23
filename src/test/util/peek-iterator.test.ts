import { PeekIterator } from '../../util/peek-iterator';

describe('PeekIterator', () => {
  describe('peek', () => {
    it('should return the next token', () => {
      const iterator = new PeekIterator((function *() { yield 5; yield 6; } ()));
      expect(iterator.peek()).toEqual(5);
    });
    it('should not advance the iterator', () => {
      const iterator = new PeekIterator((function *() { yield 5; yield 6; } ()));
      iterator.peek();
      expect(iterator.peek()).toEqual(5);
    });
  });
  describe('next', () => {
    it('should return the next token', () => {
      const iterator = new PeekIterator((function *() { yield 5; yield 6; } ()));
      expect(iterator.next().value).toEqual(5);
    });
    it('should advance the iterator', () => {
      const iterator = new PeekIterator((function *() { yield 5; yield 6; } ()));
      iterator.next();
      expect(iterator.peek()).toEqual(6);
      expect(iterator.next().value).toEqual(6);
    });
  });
});