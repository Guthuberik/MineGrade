import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        loggedIn: false,
        error: "DATABASE_URL is missing",
      });
    }

    const sql = neon(databaseUrl);

    // Получаем cookie
    const cookieHeader = req.headers.cookie || "";

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [key, ...valueParts] =
        cookie.trim().split("=");

      if (key) {
        cookies[key] =
          valueParts.join("=");
      }
    });

    const steamId =
      cookies.minegrade_steam;

    // Пользователь не вошёл
    if (!steamId) {
      return res.status(200).json({
        loggedIn: false,
      });
    }

    // Ищем пользователя
    const users = await sql`
      SELECT
        id,
        steam_id,
        steam_name,
        avatar,
        balance,
        is_admin
      FROM users
      WHERE steam_id = ${steamId}
      LIMIT 1
    `;

    // Пользователь не найден
    if (users.length === 0) {
      return res.status(200).json({
        loggedIn: false,
      });
    }

    // Пользователь найден
    return res.status(200).json({
      loggedIn: true,
      user: users[0],
    });

  } catch (error) {
    console.error(
      "AUTH ME ERROR:",
      error
    );

    return res.status(500).json({
      loggedIn: false,
      error:
        error?.message ||
        String(error),
    });
  }
}
