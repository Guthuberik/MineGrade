import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        ok: false,
        error: "DATABASE_URL is missing",
      });
    }

    const sql = neon(databaseUrl);

    const result = await sql`
      SELECT 1 AS test
    `;

    return res.status(200).json({
      ok: true,
      database: result,
    });

  } catch (error) {
    console.error("NEON ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error?.message || String(error),
      name: error?.name || "UnknownError",
    });
  }
}export default function handler(req, res) {
  res.status(200).json({
    hello: "MineGrade",
    time: new Date().toISOString()
  });
}
