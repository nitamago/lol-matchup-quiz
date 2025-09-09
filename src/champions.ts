import championsEN from "./champions.en.json";
import championsJA from "./champions.ja.json";
import championsKR from "./champions.kr.json";

type Role = "top" | "mid" | "bot" | "sup" | "jg";

// 言語ごとにマッピング
const championsByLang: Record<string, typeof championsJA> = {
  "ja": championsJA,
  "en": championsEN,
  "kr": championsKR,
};

function getChampions(role: Role): string[] {
  let lang = localStorage.getItem("lang");
  if (!lang) {
    lang = "en";
  }
  return championsByLang[lang][role];
}

export const championsByRole = () => {
   return {
    "top": getChampions("top"),
    "mid": getChampions("mid"),
    "bot": getChampions("bot"),
    "sup": getChampions("sup"),
    "jg": getChampions("jg"),
  };
}
