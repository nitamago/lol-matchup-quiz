import { useState, useRef, useEffect } from "react";
import Quiz from "./Quiz";
import QuizBotSup from "./QuizBotSup";
import Footer from "./Footer";
import TweetButton from "./TweetButton";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { championsByRole } from "./champions";
import { useSearchParams } from "react-router-dom";
import "./QuizGame.css";
import "./style.css";

interface Props {
  onBack: () => void;
}

export default function QuizGame({ onBack }: Props) {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<"top" | "mid" | "bot" | "sup" | "jg" | "bot&sup" | "">("");
  const [stage, setStage] = useState<"role" | "start" | "quiz" | "result">("role");
  const [score, setScore] = useState<number>(0);
  const [mainChampion, setMainChampion] = useState<string>(""); // 空文字 = 未選択
  const [mainChampions, setMainChampions] = useState<string[]>([]); // 空文字 = 未選択
  
  const round = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const translateMap = useRef<Record<string, string>>({});
  const translateMapRev = useRef<Record<string, string>>({});
  const chanmionIcons = useRef<Record<string, Record<string, string>>>({});
  const { t } = useTranslation();

  // 両方の JSON を読み込む
  useEffect(() => {
    const lang = localStorage.getItem("lang") || "en";
    Promise.all([
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/name_to_ja_map.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/champions.json").then((res) => res.json()),
    ]).then(([translateJson, championsJson]) => {
      translateMap.current = translateJson;
      translateMapRev.current = Object.fromEntries(
        Object.entries(translateJson).map(([key, value]) => [value, key])
      );
      chanmionIcons.current = championsJson;
    });
  }, []);

  useEffect(() => {
    if (window.gtag) {
      if (stage === "quiz") {
        window.gtag("event", "QuizStart");
      } else if (stage === "result") {
        window.gtag("event", "QuizEnd");
      } 
    }
    
    console.log(containerRef.current)
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [stage]);

  // マウント時 & クエリ変更時に反映
  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "top" || role === "mid" || role === "bot" || role === "sup" || role === "jg" || role === "bot&sup") { 
      setRole(role);
    }
    handleRoleSelect();
    const champ = searchParams.get("champ");
    if (champ) {
      setMainChampion(champ);
    }
  }, [searchParams]);

  // ロール決定
  const handleRoleSelect = () => {
    if (!role) return; // ロールが未選択なら進まない
    setRole(role);
    setStage("start");

    if (role == "top"){
      setMainChampions(championsByRole()["top"])
    } else if (role == "mid"){
      setMainChampions(championsByRole()["mid"])
    } else if (role == "bot"){
      setMainChampions(championsByRole()["bot"])
    } else if (role == "sup"){
      setMainChampions(championsByRole()["sup"])
    } else if (role == "jg"){
      setMainChampions(championsByRole()["jg"])
    }
  };

  const handleStart = () => {
    round.current = 1;
    // 未選択でも進めるのでアラート不要
    setStage("quiz");
  };

  const handleQuizEnd = (finalScore: number) => {
    setScore(finalScore);
    setStage("result");

    if (finalScore==10){
      const stored = localStorage.getItem("achievedTitles");
      let achieved: string[] = [];

      if (stored) {
        try {
          achieved = JSON.parse(stored);
        } catch (e) {
          console.error("localStorageの読み込みエラー", e);
        }
      }

      const champNameJa = translateMap.current[mainChampion];
      if (!achieved.includes(champNameJa)) {
        achieved.push(champNameJa);
        localStorage.setItem("achievedTitles", JSON.stringify(achieved));
      }
    }
  };

  const handleRetry = () => {
    round.current = 1;
    setScore(0);
    setMainChampion("");
    setStage("start");
  };

  const handleMoveRoleSelect = () => {
    setScore(0);
    setMainChampion("");
    setRole("");
    setStage("role");
  };

  return (
    <div className="container" ref={containerRef} key={stage}>
      <LanguageSwitcher></LanguageSwitcher>
      {role == "" && (<h1>{t("quiz.matchupQuiz")}</h1>)}
      {role != "" && (<h1>{t("quiz.matchupQuiz")}({role})</h1>)}
        
      {/* アプリの説明 */}
      {stage === "role" && (
        <p className="description"  style={{ whiteSpace: "pre-line" }}>
          {t("quiz.matchupQuizDesc")}
        </p>
      )}

      {/* ロール選択画面 */}
      {stage === "role" && (
        <div className="role-container">
          <h2>{t("quiz.roleSelect")}</h2>
          <div className="role-select">
            <button
              className={`role-btn top ${role === "top" ? "active" : ""}`}
              onClick={() => setRole("top")}
            />
            <button
              className={`role-btn jg ${role === "jg" ? "active" : ""}`}
              onClick={() => setRole("jg")}
            />
            <button
              className={`role-btn mid ${role === "mid" ? "active" : ""}`}
              onClick={() => setRole("mid")}
            />
            <button
              className={`role-btn bot ${role === "bot" ? "active" : ""}`}
              onClick={() => setRole("bot")}
            />
            <button
              className={`role-btn sup ${role === "sup" ? "active" : ""}`}
              onClick={() => setRole("sup")}
            />
            <button
              className={`role-btn bot-sup ${role === "bot&sup" ? "active" : ""}`}
              onClick={() => setRole("bot&sup")}
            />
          </div>

          <div className="next-btn">
            <button onClick={handleRoleSelect} disabled={!role}>
              次へ
            </button>
          </div>
        </div>
      )}
      
      {stage === "start" && (
        <div>
          <h3>{t("quiz.chooseMainChamp")}</h3>

          <div className="champion-grid">
            {mainChampions.map((c) => (
              <button
                key={c}
                onClick={() => setMainChampion((prev) => (prev === c ? "" : c))}
                className={`champion-button ${mainChampion === c ? "selected" : ""}`}
              >
                <img
                  src={chanmionIcons.current[translateMap.current[c]]['icon']}
                  alt={c}
                  className="champion-icon"
                />
              </button>
            ))}
          </div>

          <div>
            <button
              onClick={handleStart}
              className="startButton"
            >
              {t("quiz.start")}
            </button>
          </div>
        </div>
      )}

      {stage === "quiz" && role !== "bot&sup" && <Quiz role={role} mainChampion={mainChampion} round={round} onEnd={handleQuizEnd}  />}
      {stage === "quiz" && role === "bot&sup" && <QuizBotSup role={role} mainChampion={mainChampion} round={round} onEnd={handleQuizEnd} />}

      {stage === "result" && (
        <div>
          <div>
            <h2>{t("quiz.result")}: {score} / 10 </h2>
            {score==10 && (<p>{t("quiz.getTitle")}</p>)}
            <button onClick={handleRetry}>{t("quiz.retry")}</button>
          </div>
          <TweetButton role={role} mainChampion={mainChampion} score={score+" / 10"} gameUrl="https://nitamago.github.io/lol-matchup-quiz/" />
          <div id="role-select">
            <button onClick={handleMoveRoleSelect}>{t("quiz.roleSelect")}</button>
          </div>
        </div>
      )}

      <Button className="mt-6" onClick={onBack}>
        {t("quiz.menu")}
      </Button>

      {stage === "result" && (
        <div className="form-container">
          <h2 className="form-title">{t("quiz.feedback")}</h2>
          <iframe
            src="https://forms.cloud.microsoft/r/cS21bZ0bMP?embed=true"
            title="Microsoft Form"
            className="form-iframe"
            tabIndex={-1}
          ></iframe>
        </div>
      )}

      <Footer />
    </div>
  );
}
