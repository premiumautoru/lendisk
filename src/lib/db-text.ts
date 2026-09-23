/**
 * Case-insensitive `contains` filter. SQLite LIKE is already case-insensitive; PostgreSQL needs
 * `mode: "insensitive"` (which the SQLite client types don't know about, hence the cast).
 */
const isPostgres = /^postgres(ql)?:/.test(process.env.DATABASE_URL || "");

export function ci(value: string) {
  return (isPostgres ? { contains: value, mode: "insensitive" } : { contains: value }) as { contains: string };
}
