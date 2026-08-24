export default async function handler(req, res) {
  const steamId =
    req.query["openid.claimed_id"]?.split("/").pop();

  if (!steamId) {
    return res.status(400).send("Steam ID not found");
  }

  res.status(200).send(`
    <h1>Steam авторизация работает!</h1>
    <p>Steam ID: ${steamId}</p>
    <a href="/">Вернуться в MineGrade</a>
  `);
}
