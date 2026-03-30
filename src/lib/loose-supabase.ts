export type LooseRecord = Record<string, unknown>;

export type LooseSupabaseQueryBuilder<T = unknown> = {
  data: T | null;
  error: unknown | null;
  select: (columns: string) => LooseSupabaseQueryBuilder<T>;
  insert: (values: LooseRecord | LooseRecord[]) => LooseSupabaseQueryBuilder<T>;
  upsert: (values: LooseRecord | LooseRecord[]) => LooseSupabaseQueryBuilder<T>;
  eq: (column: string, value: unknown) => LooseSupabaseQueryBuilder<T>;
  order: (
    column: string,
    options?: {
      ascending?: boolean;
    },
  ) => LooseSupabaseQueryBuilder<T>;
  limit: (count: number) => LooseSupabaseQueryBuilder<T>;
  single: () => LooseSupabaseQueryBuilder<T>;
};

export type LooseSupabaseClient = {
  from: (table: string) => LooseSupabaseQueryBuilder;
};

export function isLooseRecord(value: unknown): value is LooseRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function asLooseRecord(value: unknown): LooseRecord {
  return isLooseRecord(value) ? value : {};
}
