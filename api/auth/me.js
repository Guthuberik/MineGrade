import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    const cookies = req.headers.cookie || "";

    const match = cookies.match(
      /(?:^|;\s*)minegrade_steam=([^;]+)/
    );

    if (!match) {
      return res.status(200).json({
        loggedIn: false,
      });
    }

    const steamId = match[1];

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

    res.status(200).json({
      loggedIn: true,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
}
