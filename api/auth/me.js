export default async function handler(req, res) {
  return res.status(200).json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength:
      process.env.DATABASE_URL?.length || 0,
  });
}
