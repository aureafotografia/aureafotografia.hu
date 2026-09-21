import type { Locale } from "./site";

export type Category = {
  slug: string;
  slugEn: string;
  tone: string;
  hu: { title: string; meta: string; eyebrow: string; intro: string; detail: string; slots: string[] };
  en: { title: string; meta: string; eyebrow: string; intro: string; detail: string; slots: string[] };
};

export const categories: Category[] = [
  {
    slug: "eskuvo-fotozas", slugEn: "wedding-photography", tone: "ochre",
    hu: { title: "Esküvő fotózás", meta: "szerelem · jelenlét", eyebrow: "Esküvő fotózás", intro: "A napotok hangulata, a nagy pillanatok között megbújó apró történetekkel együtt.", detail: "Könnyed jelenlét, valódi reakciók és egy képsor, amihez évek múlva is jó visszatérni.", slots: ["készülődés", "találkozás", "szertartás", "ölelés", "tánc", "másnap"] },
    en: { title: "Wedding photography", meta: "love · presence", eyebrow: "Wedding photography", intro: "The atmosphere of your day, including the small stories tucked between the big moments.", detail: "A calm presence, real reactions and a story you will want to return to for years to come.", slots: ["getting ready", "the meeting", "ceremony", "embrace", "dancing", "the next day"] },
  },
  {
    slug: "paros-fotozas", slugEn: "couples-photography", tone: "rose",
    hu: { title: "Páros fotózás", meta: "kapcsolat · közelség", eyebrow: "Páros fotózás", intro: "Közös idő, természetes mozdulatok és képek arról, ahogy igazán egymásra figyeltek.", detail: "Nem kell pózolnotok — elég, ha együtt vagytok, én pedig megőrzöm a köztetek lévő történetet.", slots: ["érintés", "nevetés", "tekintet", "séta", "ölelés", "közel"] },
    en: { title: "Couples photography", meta: "connection · closeness", eyebrow: "Couples photography", intro: "Shared time, natural gestures and photographs of the way you truly pay attention to each other.", detail: "You do not need to pose — just be together, and I will preserve the story between you.", slots: ["touch", "laughter", "gaze", "walking", "embrace", "close"] },
  },
  {
    slug: "kismama-fotozas", slugEn: "maternity-photography", tone: "moss",
    hu: { title: "Kismama fotózás", meta: "várakozás · gyengédség", eyebrow: "Kismama fotózás", intro: "Egy különleges időszak csendes, gyengéd képekben — rólad, rólatok, még mielőtt megérkezik.", detail: "Nyugodt ritmusban, természetes fénnyel és olyan képekkel, amelyekhez jó lesz visszatérni.", slots: ["várakozás", "fény", "otthon", "érintés", "pihenés", "együtt"] },
    en: { title: "Maternity photography", meta: "waiting · tenderness", eyebrow: "Maternity photography", intro: "A quiet, tender record of this special season — of you, together, before the arrival.", detail: "At an unhurried pace, with natural light and images you will be glad to return to.", slots: ["waiting", "light", "home", "touch", "rest", "together"] },
  },
  {
    slug: "csaladi-fotozas", slugEn: "family-photography", tone: "sky",
    hu: { title: "Családi fotózás", meta: "játék · együttlét", eyebrow: "Családi fotózás", intro: "A családotok igazi ritmusa: játék, ölelés, zaj és a közben megszülető csendes pillanatok.", detail: "Kis rendezéssel, sok játékkal és figyelemmel, hogy a képeken ti legyetek.", slots: ["játék", "ölelés", "otthon", "kint", "nevetés", "együtt"] },
    en: { title: "Family photography", meta: "play · togetherness", eyebrow: "Family photography", intro: "Your family’s real rhythm: play, hugs, noise and the quiet moments that appear between them.", detail: "With gentle direction, plenty of play and attention, so the photographs feel like you.", slots: ["play", "embrace", "home", "outside", "laughter", "together"] },
  },
  {
    slug: "uzleti-portre", slugEn: "business-portraits", tone: "ink",
    hu: { title: "Üzleti portré", meta: "karakter · márka", eyebrow: "Üzleti portré", intro: "Hiteles portrék rólad és a munkádról, amelyekben a szakmaiság mellett az ember is látszik.", detail: "Természetes, pontos és használható képek weboldalra, közösségi felületekre és a márkád történetéhez.", slots: ["portré", "munka", "részlet", "tér", "karakter", "márka"] },
    en: { title: "Business portraits", meta: "character · brand", eyebrow: "Business portraits", intro: "Honest portraits of you and your work, where the person behind the expertise remains visible.", detail: "Natural, considered images for your website, social channels and the story of your brand.", slots: ["portrait", "work", "detail", "space", "character", "brand"] },
  },
];

export function getCategory(locale: Locale, slug: string) {
  return categories.find((category) => (locale === "hu" ? category.slug : category.slugEn) === slug);
}
