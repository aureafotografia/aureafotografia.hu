const siteUrl = "https://aureafotografia.hu";

const routes = [
  "/",
  "/en",
  "/arak",
  "/en/prices",
  "/munkak/eskuvo-fotozas",
  "/munkak/paros-fotozas",
  "/munkak/kismama-fotozas",
  "/munkak/csaladi-fotozas",
  "/munkak/uzleti-portre",
  "/munkak/sport-fotozas",
  "/en/work/wedding-photography",
  "/en/work/couples-photography",
  "/en/work/maternity-photography",
  "/en/work/family-photography",
  "/en/work/business-portraits",
  "/en/work/sports-photography",
];

export function GET() {
  const urls = routes.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
