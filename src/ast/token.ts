export interface Token {
  type: string;
  subtype?: string;
  value?: string;
}

export function match(token: Token): string {
  return `${token.type}:${token.value}`;
}