/* eslint-disable */
/**
 * Generated Convex server utilities
 */
export type QueryCtx = any;
export type MutationCtx = any;
export type ActionCtx = any;

export interface QueryDefinition {
  args?: any;
  handler: (ctx: any, args: any) => Promise<any> | any;
}

export interface MutationDefinition {
  args?: any;
  handler: (ctx: any, args: any) => Promise<any> | any;
}

export function query<T extends QueryDefinition>(def: T): any {
  return def;
}

export function mutation<T extends MutationDefinition>(def: T): any {
  return def;
}

export function action<T extends QueryDefinition>(def: T): any {
  return def;
}
