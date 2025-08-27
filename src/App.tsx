import { useState } from "react";
import Quiz from "./Quiz";
import "./App.css";
import "./style.css";

const mainChampions = ["アーゴット", "ダリウス", "フィオラ", "ティーモ", "ガレン"]; // 必要に応じて追加

export default function App() {
  const [stage, setStage] = useState<"start" | "quiz" | "result">("start");
  const [score, setScore] = useState<number>(0);
  const [mainChampion, setMainChampion] = useState<string>(""); // 空文字 = 未選択

  const handleStart = () => {
    // 未選択でも進めるのでアラート不要
    setStage("quiz");
  };

  const handleQuizEnd = (finalScore: number) => {
    setScore(finalScore);
    setStage("result");
  };

  const handleRetry = () => {
    setScore(0);
    setMainChampion("");
    setStage("start");
  };

  return (
    <div className="container">
      <h1>マッチアップクイズ</h1>

      {stage === "start" && (
        <div>
          <h3>メインチャンピオンを選択（任意）</h3>
          <select
            value={mainChampion}
            onChange={(e) => setMainChampion(e.target.value)}
          >
            <option value="">なし</option>
            {mainChampions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div>
            <button onClick={handleStart} className="startButton">
              スタート
            </button>
          </div>
        </div>
      )}

      {stage === "quiz" && <Quiz mainChampion={mainChampion} onEnd={handleQuizEnd} />}

      {stage === "result" && (
        <div>
          <h2>結果: {score} / 10 </h2>
          <button onClick={handleRetry}>再挑戦</button>
        </div>
      )}
    </div>
  );
}
