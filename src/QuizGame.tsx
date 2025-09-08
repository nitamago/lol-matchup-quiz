import { useState, useRef, useEffect } from "react";
import Quiz from "./Quiz";
import QuizBotSup from "./QuizBotSup";
import Footer from "./Footer";
import TweetButton from "./TweetButton";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { championsByRole } from "./champions";
import "./QuizGame.css";
import "./style.css";

interface Props {
  onBack: () => void;
}

export default function QuizGame({ onBack }: Props) {
  const [role, setRole] = useState<"top" | "mid" | "bot" | "sup" | "jg" | "bot&sup" | "">("");
  const [stage, setStage] = useState<"role" | "start" | "quiz" | "result">("role");
  const [score, setScore] = useState<number>(0);
  const [mainChampion, setMainChampion] = useState<string>(""); // 空文字 = 未選択
  const [mainChampions, setMainChampions] = useState<string[]>([]); // 空文字 = 未選択
  
  const round = useRef<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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
        <div>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="">{t("quiz.no")}</option>
            <option value="top">Top</option>
            <option value="jg">JG</option>
            <option value="mid">Mid</option>
            <option value="bot">Bot</option>
            <option value="sup">Sup</option>
            <option value="bot&sup">Bot&Sup</option>
          </select>
          <div>
            <button onClick={handleRoleSelect} disabled={!role}>
              次へ
            </button>
          </div>
        </div>
      )}
      
      {stage === "start" && (
        <div>
          <h3>{t("quiz.chooseMainChamp")}</h3>
          <select
            value={mainChampion}
            onChange={(e) => {
              console.log("e.target.value", e.target.value)
              setMainChampion(e.target.value)}}
          >
            <option value="">{t("quiz.no")}</option>
            {mainChampions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div>
            <button onClick={handleStart} className="startButton">
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
