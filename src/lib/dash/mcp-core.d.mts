export function createMcp(opts: { db: unknown; site: string; secret?: string; sheets?: unknown }): (msg: unknown) => Promise<Record<string, unknown> | null>;
