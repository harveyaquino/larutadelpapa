export default function handler(req, res) {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || "";

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  res.status(200).send(
    `window.SUPABASE_URL = ${JSON.stringify(url)};\n` +
    `window.SUPABASE_ANON_KEY = ${JSON.stringify(key)};\n`
  );
}
