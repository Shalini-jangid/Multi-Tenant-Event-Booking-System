declare module 'bcryptjs' {
  export function hashSync(data: any, salt: string | number): string;
  export function hash(data: any, salt: string | number): Promise<string>;
  export function compareSync(data: any, encrypted: string): boolean;
  export function compare(data: any, encrypted: string): Promise<boolean>;
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
}