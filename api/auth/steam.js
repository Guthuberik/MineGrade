export default function handler(req, res) {
  const returnUrl =
    "https://mine-grade.vercel.app/api/auth/steam/callback";

  const realm =
    "https://mine-grade.vercel.app/";

  const steamUrl =
    "https://steamcommunity.com/openid/login" +
    "?openid.ns=http://specs.openid.net/auth/2.0" +
    "&openid.mode=checkid_setup" +
    "&openid.return_to=" +
    encodeURIComponent(returnUrl) +
    "&openid.realm=" +
    encodeURIComponent(realm) +
    "&openid.identity=http://specs.openid.net/auth/2.0/identifier_select" +
    "&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select";

  res.redirect(302, steamUrl);
}
