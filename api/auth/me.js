import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    const cookieHeader = req.headers.cookie || "";

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [key, ...valueParts] = cookie.trim().split("=");

      if (key) {
        cookies[key] = valueParts.join("=");
      }
    });

    const steamId = cookies.minegrade_steam;

    if (!steamId) {
      return res.status(200).json({
        loggedIn: false,
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
      WHERE steam_id = ${steamId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(200).json({
        loggedIn: false,
      });
    }

    const user = users[0];

    return res.status(200).json({
      loggedIn: true,
      user: user,
    });

  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    return res.status(500).json({
      loggedIn: false,
      error: error.message,
    });
  }
}
