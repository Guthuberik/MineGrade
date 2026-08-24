import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    // Получаем Steam ID из cookie
    const cookieHeader = req.headers.cookie || "";

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [key, ...valueParts] =
        cookie.trim().split("=");

      if (key) {
        cookies[key] = valueParts.join("=");
      }
    });

    const steamId = cookies.minegrade_steam;

    if (!steamId) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    // Проверяем, что пользователь реально админ
    const admins = await sql`
      SELECT is_admin
      FROM users
      WHERE steam_id = ${steamId}
      LIMIT 1
    `;

    if (
      admins.length === 0 ||
      admins[0].is_admin !== true
    ) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const {
      targetSteamId,
      amount,
    } = req.body;

    const numericAmount =
      Number(amount);

    if (
      !targetSteamId ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        error: "Invalid data",
      });
    }

    // Выдаём баланс
    const updated = await sql`
      UPDATE users
      SET balance = balance + ${numericAmount}
      WHERE steam_id = ${targetSteamId}
      RETURNING
        steam_id,
        steam_name,
        balance
    `;

    if (updated.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: updated[0],
    });

  } catch (error) {
    console.error(
      "ADMIN BALANCE ERROR:",
      error
    );

    return res.status(500).json({
      error: "Server error",
    });
  }
}
