import sql from "../../db.js";

export default async function handler(req, res) {
  try {
    const claimedId = req.query["openid.claimed_id"];

    if (!claimedId) {
      return res.status(400).send("Steam ID not found");
    }

    const steamId = claimedId.split("/").pop();

    if (!/^\d{17}$/.test(steamId)) {
      return res.status(400).send("Invalid Steam ID");
    }

    // Проверяем авторизацию через Steam
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key.startsWith("openid.")) {
        params.append(
          key,
          Array.isArray(value) ? value[0] : value
        );
      }
    }

    params.set(
      "openid.mode",
      "check_authentication"
    );

    const response = await fetch(
      "https://steamcommunity.com/openid/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const verification = await response.text();

    if (!verification.includes("is_valid:true")) {
      return res
        .status(401)
        .send("Steam authentication failed");
    }

    // ==========================================
    // Получаем Steam-профиль
    // ==========================================

    let steamName = "Steam User";
    let avatar = null;

    try {
      const steamResponse = await fetch(
        `https://steamcommunity.com/profiles/${steamId}?xml=1`
      );

      const xml = await steamResponse.text();

      const nameMatch =
        xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);

      const avatarMatch =
        xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);

      if (nameMatch) {
        steamName = nameMatch[1];
      }

      if (avatarMatch) {
        avatar = avatarMatch[1];
      }
    } catch (profileError) {
      console.error(
        "STEAM PROFILE ERROR:",
        profileError
      );
    }

    // ==========================================
    // Ищем пользователя
    // ==========================================

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
          avatar,
          balance,
          is_admin
        )
        VALUES (
          ${steamId},
          ${steamName},
          ${avatar},
          1000,
          ${
            steamId ===
            process.env.ADMIN_STEAM_ID
          }
        )
        RETURNING *
      `;

      user = created[0];

    } else {

      const updated = await sql`
        UPDATE users
        SET
          steam_name = ${steamName},
          avatar = ${avatar}
        WHERE steam_id = ${steamId}
        RETURNING *
      `;

      user = updated[0];
    }

    // ==========================================
    // Сохраняем SteamID в cookie
    // ==========================================

    res.setHeader(
      "Set-Cookie",
      `minegrade_steam=${encodeURIComponent(
        steamId
      )}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
    );

    // Возвращаем пользователя на сайт
    res.redirect(302, "/");

  } catch (error) {

    console.error(
      "STEAM CALLBACK ERROR:",
      error
    );

    return res
      .status(500)
      .send("Authentication server error");
  }
}
