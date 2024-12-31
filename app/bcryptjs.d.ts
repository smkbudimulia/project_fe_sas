declare module "bcryptjs" {
    export function hashSync(data: string, salt: number): string;
    export function compareSync(data: string, encrypted: string): boolean;
    export function genSaltSync(rounds?: number): string;
    export function compare(data: string, encrypted: string): Promise<boolean>;
  }
  