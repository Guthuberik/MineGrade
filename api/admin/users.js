import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    const cookieHeader =
      req.headers.cookie || "";

    const cookies = {};

    cookieHeader
      .split(";")
      .forEach((cookie) => {
        const [
          key,
          ...valueParts
        ] = cookie
          .trim()
          .split("=");

        if (key) {
          cookies[key] =
            valueParts.join("=");
        }
      });

    const steamId =
      cookies.minegrade_steam;

    if (!steamId) {
      return res
        .status(401)
        .json({
          error: "Not logged in",
        });
    }

    // Проверяем, что это админ
    const admins = await sql`
      SELECT is_admin
      FROM users
      WHERE steam_id = ${steamId}
      LIMIT 1
    `;

    if (
      admins.length === 0 ||
      !admins[0].is_admin
    ) {
      return res
        .status(403)
        .json({
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
      ORDER BY id ASC
    `;

    return res.status(200).json({
      users,
    });

  } catch (error) {
    console.error(
      "ADMIN USERS ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Server error",
      });
  }
}
