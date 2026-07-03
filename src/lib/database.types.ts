/**
 * Supabase database types.
 *
 * This is a permissive placeholder so the app typechecks before a project is
 * provisioned — every table read/write is `any` for now. Once your Supabase
 * project exists, regenerate the real, fully typed version with:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 *
 * (or `--local` when running the local stack). That replaces this file with
 * row-level types and gives you compile-time safety across every service call.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
