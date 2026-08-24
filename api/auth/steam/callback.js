import sql from "../../db.js";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const params = req.query;

    const claimedId = params["openid.claimed_id"];

    if (!claimedId) {
      return res.status(400).send("Steam ID not found");
    }

    const steamId = claimedId.split("/").pop();

    if (!/^\d{17}$/.test(steamId)) {
      return res.status(400).send("Invalid Steam ID");
    }

    // Проверяем OpenID через Steam
    const verificationParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (key.startsWith("openid.")) {
        verificationParams.append(
          key,
          Array.isArray(value) ? value[0] : value
        );
      }
    }

    verificationParams.set(
      "openid.mode",
      "check_authentication"
    );

    const verificationResponse = await fetch(
      "https://steamcommunity.com/openid/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: verificationParams.toString(),
      }
    );

    const verificationText =
      await verificationResponse.text();

    if (
      !verificationText.includes(
        "is_valid:true"
      )
    ) {
      return res
        .status(401)
        .send("Steam authentication failed");
    }

    // Ищем пользователя
    const users = await sql`
      SELECT *
      FROM users
      WHERE steam_id = ${steamId}
      LIMIT 1
    `;

    let user;

    if (users.length === 0) {
      const created = await sql`
        INSERT INTO users (
          steam_id,
          steam_name,
          balance,
          is_admin
        )
        VALUES (
          ${steamId},
          ${"Steam User"},
          ${1000},
          ${
            steamId ===
            process.env.ADMIN_STEAM_ID
          }
        )
        RETURNING *
      `;

      user = created[0];
    } else {
      user = users[0];
    }

    // Создаём случайный session ID
    const sessionId =
      crypto.randomBytes(32).toString("hex");

    // Пока храним session ID в cookie.
    // Позже вынесем сессии в отдельную таблицу.
    res.setHeader(
      "Set-Cookie",
      `minegrade_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
    );

    // Для первой версии запоминаем SteamID
    // в отдельной cookie.
    res.setHeader(
      "Set-Cookie",
      [
        `minegrade_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        `minegrade_steam=${steamId}; Path=/; Secure; SameSite=Lax; Max-Age=604800`,
      ]
    );

    res.redirect(302, "/");
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .send("Authentication server error");
  }
}export default async function handler(req, res) {
  const steamId =
    req.query["openid.claimed_id"]?.split("/").pop();

  if (!steamId) {
    return res.status(400).send("Steam ID not found");
  }

  const adminSteamId = process.env.ADMIN_STEAM_ID;

  const isAdmin = steamId === adminSteamId;

  res.status(200).json({
    steamId,
    isAdmin,
    message: isAdmin
      ? "Admin authorization successful"
      : "User authorization successful",
  });
}
