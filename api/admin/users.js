import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const cookieHeader =
      req.headers.cookie || "";

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [key, ...valueParts] =
        cookie.trim().split("=");

      if (key) {
        cookies[key] =
          valueParts.join("=");
      }
    });

    const adminSteamId =
      cookies.minegrade_steam;

    if (!adminSteamId) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const admins = await sql`
      SELECT is_admin
      FROM users
      WHERE steam_id = ${adminSteamId}
      LIMIT 1
    `;

    if (
      admins.length === 0 ||
      !admins[0].is_admin
    ) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const users = await sql`
      SELECT
        id,
        steam_id,
        steam_name,
        avatar,
        balance,
        is_admin
      FROM users
      ORDER BY id DESC
      LIMIT 100
    `;

    return res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error(
      "ADMIN USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        String(error),
    });
  }
}
