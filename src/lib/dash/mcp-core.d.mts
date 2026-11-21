export function createMcp(opts: { db: unknown; site: string; secret?: string }): (msg: unknown) => Promise<Record<string, unknown> | null>;
