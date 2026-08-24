import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    const result = await sql`
      SELECT 1 AS test
    `;

    return res.status(200).json({
      ok: true,
      database: result,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
