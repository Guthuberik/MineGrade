import sql from "../../db.js";

function getCookie(req, name) {
  const cookieHeader =
    req.headers.cookie || "";

  const cookies = {};

  cookieHeader
    .split(";")
    .forEach((cookie) => {
      const [key, ...valueParts] =
        cookie.trim().split("=");

      if (key) {
        cookies[key] =
          valueParts.join("=");
      }
    });

  return cookies[name];
}

export default async function handler(
  req,
  res
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    // Кто сейчас авторизован
    const steamId =
      getCookie(
        req,
        "minegrade_steam"
      );

    if (!steamId) {
      return res.status(401).json({
        error:
          "You are not authenticated",
      });
    }

    // Проверяем, что это админ
    const admins = await sql`
      SELECT id, steam_id, steam_name, is_admin
      FROM users
      WHERE steam_id = ${steamId}
      LIMIT 1
    `;

    if (
      admins.length === 0 ||
      !admins[0].is_admin
    ) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const {
      targetSteamId,
      amount,
    } = req.body || {};

    if (
      !targetSteamId ||
      !/^\d{17}$/.test(
        String(targetSteamId)
      )
    ) {
      return res.status(400).json({
        error: "Invalid Steam ID",
      });
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    // Ищем игрока
    const users = await sql`
      SELECT *
      FROM users
      WHERE steam_id = ${targetSteamId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(404).json({
        error:
          "User not found",
      });
    }

    // Начисляем баланс
    const updated = await sql`
      UPDATE users
      SET balance =
        balance + ${numericAmount}
      WHERE steam_id =
        ${targetSteamId}
      RETURNING
        id,
        steam_id,
        steam_name,
        avatar,
        balance,
        is_admin
    `;

    return res.status(200).json({
      ok: true,
      user: updated[0],
    });

  } catch (error) {
    console.error(
      "ADMIN BALANCE ERROR:",
      error
    );

    return res.status(500).json({
      error:
        "Internal server error",
    });
  }
}
