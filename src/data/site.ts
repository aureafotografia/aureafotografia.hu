export type Locale = "hu" | "en";

export const photographer = {
  name: "Kulcsár-Horváth Alexandra",
  brand: "Aurea Fotográfia",
  instagram: "https://www.instagram.com/aurea_fotografia_/",
  email: "alexandra.kulcsarhorvath@gmail.com",
};

export const copy = {
  hu: {
    languageName: "Magyar",
    alternateLabel: "EN",
    alternateHref: "/en/",
    nav: [
      { label: "Portfólió", href: "#munkak" },
      { label: "Rólam", href: "#rolam" },
      { label: "Foglalás", href: "#csomagok" },
    ],
    heroEyebrow: "AUREA FOTOGRÁFIA · by Alexandra",
    heroTitle: "Your Light. Your Story.",
    heroSubtitle: "A pillanat, ami te vagy.",
    heroBody:
      "Azokat a pillanatokat szeretem megfogni, amikor igazán önmagad vagy. Legyen szó szerelemről, családról, anyaságról, egy esküvő napjáról vagy éppen a hivatásodról, szeretem észrevenni az apró részleteket, amik a történetedet igazán a tiéddé teszik. A célom, hogy a képeken ne csak azt lásd, ami történt, hanem azt is, ami mögötte volt.",
    heroCta: "Megnézem a munkákat",
    introLabel: "RÓLAM",
    introTitle: "Amit nem lehet megtervezni, azt érdemes megőrizni.",
    introBody:
      "Mindig is a fotózás volt az, amiben igazán ki tudtam fejezni magam. Szeretem a szépen megkomponált, editorial hangulatú képeket, de közben folyamatosan azokat a pillanatokat keresem, amiket nem lehet megtervezni: egy tekintetet, egy érintést, egy nevetést vagy egy apró részletet, amit talán más észre sem venne. Ezekből áll össze számomra egy történet.",
    introLink: "Többet rólam",
    workLabel: "Válogatott munkák",
    workTitle: "Történetek, ahogy megtörténtek.",
    categories: [
      { title: "Esküvő", meta: "szerelem · jelenlét", tone: "ochre" },
      { title: "Portré", meta: "arc · karakter", tone: "rose" },
      { title: "Lifestyle", meta: "otthon · hétköznap", tone: "moss" },
      { title: "Üzleti", meta: "márka · ember", tone: "ink" },
      { title: "Kisállat", meta: "játék · kapcsolat", tone: "sky" },
    ],
    pricingLabel: "Csomagok és árak",
    pricingTitle: "Meséljetek arról, ami most fontos.",
    pricingBody:
      "Minden fotózás más ritmusú. A csomagokat átláthatóan, a történetetekhez igazítva állítjuk össze.",
    pricingCta: "Érdeklődöm",
    footerNote: "Budapest · Magyarország · 2026",
  },
  en: {
    languageName: "English",
    alternateLabel: "HU",
    alternateHref: "/",
    nav: [
      { label: "Work", href: "#work" },
      { label: "About", href: "#about" },
      { label: "Packages", href: "#packages" },
    ],
    heroEyebrow: "AUREA FOTOGRÁFIA · by Alexandra",
    heroTitle: "Your Light. Your Story.",
    heroSubtitle: "A moment that feels like you.",
    heroBody:
      "I love photographing the moments when you’re most yourself. Whether it’s love, family, motherhood, your wedding day or the work you do, I look for the little details that make the story yours. I want your photographs to bring back what happened and what it meant to you.",
    heroCta: "Explore the work",
    introLabel: "About",
    introTitle: "The moments you can’t plan are the ones worth keeping.",
    introBody:
      "Photography has always been how I express myself best. I love carefully composed images with an editorial feel, and I’m always looking for the moments you can’t plan: a glance, a touch, a laugh or a little detail someone else might miss. Those are the things that make up a story for me.",
    introLink: "More about me",
    workLabel: "Selected work",
    workTitle: "Stories, exactly as they happened.",
    categories: [
      { title: "Weddings", meta: "love · presence", tone: "ochre" },
      { title: "Portraits", meta: "face · character", tone: "rose" },
      { title: "Lifestyle", meta: "home · everyday", tone: "moss" },
      { title: "Business", meta: "brand · human", tone: "ink" },
      { title: "Pets", meta: "play · connection", tone: "sky" },
    ],
    pricingLabel: "Packages and pricing",
    pricingTitle: "Tell me what matters right now.",
    pricingBody:
      "Every session has its own rhythm. We shape the package clearly around the story you want to keep.",
    pricingCta: "Get in touch",
    footerNote: "Budapest · Hungary · 2026",
  },
} satisfies Record<Locale, Record<string, unknown>>;
