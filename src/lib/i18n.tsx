import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "ta";

const dict = {
  en: {
    brand: "Sattiyar Matrimony",
    tagline: "Trusted matchmaking for the Sattiyar community",
    home: "Home", search: "Search", sangam: "Sangam", contact: "Contact", login: "Login", register: "Register",
    dashboard: "Dashboard", logout: "Logout", admin: "Admin",
    heroTitle: "Find Your Perfect Life Partner",
    heroSub: "Thousands of verified Sattiyar profiles from across Tamil Nadu — start your sacred journey today.",
    quickSearch: "Quick Search",
    age: "Age", gender: "Gender", location: "Location", male: "Male", female: "Female",
    findMatches: "Find Matches",
    successStories: "Happy Couples",
    storiesSub: "Real stories from couples who found love through us",
    testimonials: "What Our Members Say",
    footerNote: "Bringing families together with trust and tradition",
  },
  ta: {
    brand: "சத்தியர் திருமண தளம்",
    tagline: "சத்தியர் சமூகத்திற்கான நம்பகமான திருமண சேவை",
    home: "முகப்பு", search: "தேடு", sangam: "சங்கம்", contact: "தொடர்பு", login: "உள்நுழை", register: "பதிவு",
    dashboard: "சுயவிவரம்", logout: "வெளியேறு", admin: "நிர்வாகி",
    heroTitle: "உங்கள் வாழ்க்கைத் துணையை கண்டறியுங்கள்",
    heroSub: "தமிழ்நாடு முழுவதிலும் உள்ள ஆயிரக்கணக்கான சத்தியர் சுயவிவரங்கள்.",
    quickSearch: "விரைவு தேடல்",
    age: "வயது", gender: "பாலினம்", location: "ஊர்", male: "ஆண்", female: "பெண்",
    findMatches: "பொருத்தங்களை தேடு",
    successStories: "மகிழ்ச்சியான தம்பதிகள்",
    storiesSub: "எங்கள் மூலம் இணைந்த தம்பதிகளின் கதைகள்",
    testimonials: "எங்கள் உறுப்பினர்கள் கூறுவது",
    footerNote: "நம்பிக்கை மற்றும் பாரம்பரியத்துடன் குடும்பங்களை இணைக்கிறோம்",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict.en) => string };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved) setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };
  const t = (k: keyof typeof dict.en) => dict[lang][k] || dict.en[k];
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
