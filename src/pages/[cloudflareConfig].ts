import { getImage } from "astro:assets";
import { homepageAboutImage, homepageCategoryImages, homepageHeroImage } from "../data/homepage-images";

export function getStaticPaths() {
  return [{ params: { cloudflareConfig: "_redirects" } }];
}

export async function GET() {
  const images = {
    hero: homepageHeroImage,
    "about-alexandra": homepageAboutImage,
    wedding: homepageCategoryImages["eskuvo-fotozas"],
    maternity: homepageCategoryImages["kismama-fotozas"],
    business: homepageCategoryImages["uzleti-portre"],
    family: homepageCategoryImages["csaladi-fotozas"],
    couple: homepageCategoryImages["paros-fotozas"],
    sport: homepageCategoryImages["sport-fotozas"],
  };
  const redirects = await Promise.all(Object.entries(images).map(async ([name, source]) => {
    const image = await getImage({ src: source, width: 1200, format: "jpeg", quality: 82 });
    return `/images/homepage/${name}.jpg ${image.src} 301`;
  }));
  return new Response(redirects.join("\n") + "\n");
}
