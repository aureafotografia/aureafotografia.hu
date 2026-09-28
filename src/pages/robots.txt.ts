const siteUrl = "https://aureafotografia.hu";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
