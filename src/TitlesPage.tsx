import React, { useEffect, useState } from "react";
import { championsByRole } from "./champions";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import "./TitlesPage.css";

interface Champion {
  name: string;
  icon: string;
}

interface ChampionJson {
  [key: string]: Champion;
}

interface RolesJson {
  [role: string]: string[];
}

interface TitleListProps {
  achievedTitles: string[]; // 達成済みのチャンピオン名リスト
}

interface Props {
  onBack: () => void;
}

export default function TitlesPage({ onBack }: Props) {
  const [champions, setChampions] = useState<ChampionJson>({});
  const [roles, setRoles] = useState<RolesJson>({});
  const [achievedTitles, setAchievedTitles] = useState<string[]>([]);
  const [nameMap, setNameMap] = useState<{[key: string]: string}>({});
  const [achievementMap, setAchievementMap] = useState<{[key: string]: string}>({});
  const { t } = useTranslation();


  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "TitlesPage");
    }
    const lang = localStorage.getItem("lang") || "en";
    Promise.all([
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/champions.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/name_to_ja_map.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/achievement_name.json").then((res) => res.json()),
    ]).then(([championData, nameMap, achievementMap]) => {
      setChampions(championData);
      setNameMap(nameMap);
      setRoles(championsByRole());
      setAchievementMap(achievementMap);
    });
    const stored = localStorage.getItem("achievedTitles");
    if (stored) {
      try {
        setAchievedTitles(JSON.parse(stored));
      } catch (e) {
        console.error("localStorageのachievedTitlesの読み込みに失敗", e);
      }
    }
  }, []);

  return (
    <div className="title-list">
      <Button className="menu-button" onClick={onBack}>
        {t("quiz.menu")}
      </Button>
      <h1>{t("titles.list")}</h1>
      <p>{t("titles.description")}</p>
      {Object.entries(roles).map(([role, champs]) => (
        <div key={role} className="role-section">
          <h2 className="role-title">{role.toUpperCase()}</h2>
          <div className="title-grid">
            {champs.map((champName) => {
              const champ = champions[nameMap[champName]];
              const isAchieved = achievedTitles.includes(nameMap[champName]);
              if (!champ) return null;
              return (
                <div className={`title-card ${isAchieved ? "" : "not-achieved"}`} key={champ.name}>
                  <img
                    src={champ.icon}
                    alt={champName}
                    className="title-icon"
                  />
                  <p className="title-name">{achievementMap[role.toLowerCase()+"-"+champ.name]}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
