export default async function handler(req, res) {
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
