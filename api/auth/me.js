export default async function handler(req, res) {
  try {
    const { neon } = await import("@neondatabase/serverless");

    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`SELECT 1 AS test`;

    return res.status(200).json({
      ok: true,
      database: result,
    });
  } catch (error) {
    console.error("NEON ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error?.message || String(error),
      name: error?.name || null,
    });
  }
}export default async function handler(req, res) {
  return res.status(200).json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength:
      process.env.DATABASE_URL?.length || 0,
  });
}
