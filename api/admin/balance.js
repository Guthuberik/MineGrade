import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res
        .status(405)
        .json({
          error: "Method not allowed",
        });
    }

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

    const adminSteamId =
      cookies.minegrade_steam;

    if (!adminSteamId) {
      return res
        .status(401)
        .json({
          error:
            "Not logged in",
        });
    }

    // Проверяем админа
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
      return res
        .status(403)
        .json({
          error:
            "Access denied",
        });
    }

    const {
      steamId,
      amount,
    } = req.body || {};

    const value = Number(amount);

    if (
      !steamId ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return res
        .status(400)
        .json({
          error:
            "Invalid data",
        });
    }

    const updated = await sql`
      UPDATE users
      SET balance =
        balance + ${value}
      WHERE steam_id =
        ${steamId}
      RETURNING
        id,
        steam_id,
        steam_name,
        avatar,
        balance,
        is_admin
    `;

    if (updated.length === 0) {
      return res
        .status(404)
        .json({
          error:
            "User not found",
        });
    }

    return res.status(200).json({
      ok: true,
      user: updated[0],
    });

  } catch (error) {
    console.error(
      "ADMIN BALANCE ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          error.message,
      });
  }
}
