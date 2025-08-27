import { useState } from "react";
import Quiz from "./Quiz";
import "./App.css";
import "./style.css";


export default function App() {
  const [role, setRole] = useState<"top" | "mid" | "bot" | "">("");
  const [stage, setStage] = useState<"role" | "start" | "quiz" | "result">("role");
  const [score, setScore] = useState<number>(0);
  const [mainChampion, setMainChampion] = useState<string>(""); // 空文字 = 未選択
  const [mainChampions, setMainChampions] = useState<string[]>([]); // 空文字 = 未選択

  // ロール決定
  const handleRoleSelect = () => {
    if (!role) return; // ロールが未選択なら進まない
    setRole(role);
    setStage("start");

    if (role == "top"){
      setMainChampions(["アーゴット", "イラオイ", "ヨリック", "ダリウス", "フィオラ", "ティーモ", "ガレン"])
    }
  };

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
      {role == "" && (<h1>マッチアップクイズ</h1>)}
      {role != "" && (<h1>マッチアップクイズ({role})</h1>)}
      
      {/* ロール選択画面 */}
      {stage === "role" && (
        <div>
          <h3>ロールを選択してください</h3>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="">未選択</option>
            <option value="top">Top</option>
            <option value="mid">Mid</option>
            <option value="bot">Bot</option>
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

      {stage === "quiz" && <Quiz role={role} mainChampion={mainChampion} onEnd={handleQuizEnd} />}

      {stage === "result" && (
        <div>
          <h2>結果: {score} / 10 </h2>
          <button onClick={handleRetry}>再挑戦</button>
        </div>
      )}
    </div>
  );
}
