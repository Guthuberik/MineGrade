import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Получаем Steam ID из cookie
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

    const adminSteamId =
      cookies.minegrade_steam;

    if (!adminSteamId) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    // Проверяем администратора НА СЕРВЕРЕ
    const admins = await sql`
      SELECT id, steam_id, is_admin
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

    const {
      steamId,
      amount,
    } = req.body || {};

    if (!steamId) {
      return res.status(400).json({
        success: false,
        error: "Steam ID is required",
      });
    }

    const parsedAmount =
      Number(amount);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount === 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    // Не позволяем создать отрицательный баланс
    const result = await sql`
      UPDATE users
      SET balance = GREATEST(0, balance + ${parsedAmount})
      WHERE steam_id = ${steamId}
      RETURNING
        id,
        steam_id,
        steam_name,
        avatar,
        balance,
        is_admin
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: result[0],
    });

  } catch (error) {
    console.error(
      "ADMIN BALANCE ERROR:",
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
