import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    // Только POST
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    // =========================
    // Читаем cookie
    // =========================

    const cookieHeader = req.headers.cookie || "";

    const cookies = {};

    cookieHeader.split(";").forEach((cookie) => {
      const [key, ...valueParts] =
        cookie.trim().split("=");

      if (key) {
        cookies[key] = valueParts.join("=");
      }
    });

    const adminSteamId =
      cookies.minegrade_steam;

    // =========================
    // Проверяем авторизацию
    // =========================

    if (!adminSteamId) {
      return res.status(401).json({
        error: "Не авторизован",
      });
    }

    // =========================
    // Проверяем админа через БД
    // =========================

    const admins = await sql`
      SELECT
        id,
        steam_id,
        steam_name,
        is_admin
      FROM users
      WHERE steam_id = ${adminSteamId}
      LIMIT 1
    `;

    if (admins.length === 0) {
      return res.status(403).json({
        error: "Пользователь не найден",
      });
    }

    const admin = admins[0];

    if (!admin.is_admin) {
      return res.status(403).json({
        error: "Нет доступа",
      });
    }

    // =========================
    // Получаем данные запроса
    // =========================

    const {
      targetSteamId,
      amount,
    } = req.body || {};

    if (!targetSteamId) {
      return res.status(400).json({
        error: "Не указан Steam ID",
      });
    }

    if (!/^\d{17}$/.test(String(targetSteamId))) {
      return res.status(400).json({
        error: "Некорректный Steam ID",
      });
    }

    const money = Number(amount);

    if (!Number.isFinite(money)) {
      return res.status(400).json({
        error: "Некорректная сумма",
      });
    }

    if (money <= 0) {
      return res.status(400).json({
        error: "Сумма должна быть больше 0",
      });
    }

    // =========================
    // Ищем пользователя
    // =========================

    const users = await sql`
      SELECT
        id,
        steam_id,
        steam_name,
        avatar,
        balance,
        is_admin
      FROM users
      WHERE steam_id = ${targetSteamId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(404).json({
        error: "Пользователь не найден",
      });
    }

    // =========================
    // Выдаём баланс
    // =========================

    const updated = await sql`
      UPDATE users
      SET balance = balance + ${money}
      WHERE steam_id = ${targetSteamId}
      RETURNING
        id,
        steam_id,
        steam_name,
        avatar,
        balance,
        is_admin
    `;

    if (updated.length === 0) {
      return res.status(500).json({
        error: "Не удалось обновить баланс",
      });
    }

    // =========================
    // Ответ
    // =========================

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
      error: "Ошибка сервера",
      details: error.message,
    });
  }
}
