import { useState, useRef } from "react";
import Quiz from "./Quiz";
import QuizBotSup from "./QuizBotSup";
import Footer from "./Footer";
import TweetButton from "./TweetButton";
import { Button } from "@/components/ui/button";
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

  // ロール決定
  const handleRoleSelect = () => {
    if (!role) return; // ロールが未選択なら進まない
    setRole(role);
    setStage("start");

    if (role == "top"){
      setMainChampions([
        "アーゴット",
        "アンベッサ",
        "イラオイ",
        "イレリア",
        "オラフ",
        "ガレン",
        "クイン",
        "ケイル",
        "ケネン",
        "カミール",
        "クレッド",
        "ザック",
        "ジャックス",
        "シェン",
        "シンジド",
        "セト",
        "ダリウス",
        "チョ＝ガス",
        "トリンダメア",
        "ナサス",
        "パンテオン",
        "フィオラ",
        "ブラッドミア",
        "ポッピー",
        "マルファイト",
        "モルデカイザー",
        "ヨネ",
        "ランブル",
        "リヴェン"
      ])
    } else if (role == "mid"){
      setMainChampions([
        "アクシャン",
        "アニビア",
        "アニー",
        "イレリア",
        "エコー",
        "オリアナ",
        "カタリナ",
        "ガリオ",
        "キヤナ",
        "サイオン",
        "サイラス",
        "シンドラ",
        "ゼド",
        "ゼラス",
        "ゾーイ",
        "タリヤ",
        "タロン",
        "ダイアナ",
        "ツイステッド・フェイト",
        "パンテオン",
        "ビクター",
        "フェイ",
        "ブラッドミア",
        "ヤスオ",
        "ヨネ",
        "ラックス",
        "ルブラン"
      ])
    } else if (role == "bot"){
      setMainChampions([
        "アッシュ",
        "アフェリオス",
        "エズリアル",
        "カイ＝サ",
        "カリスタ",
        "コーキ",
        "コグ＝マウ",
        "サミーラ",
        "ザヤ",
        "シヴィア",
        "ジグス",
        "ジンクス",
        "ジン",
        "スモルダー",
        "ゼリ",
        "セナ",
        "タロン",
        "トゥイッチ",
        "トリスターナ",
        "ドレイヴン",
        "ニーラ",
        "ミス・フォーチュン",
        "ユナラ",
        "ルシアン",
        "ヴァルス",
        "ヴェイン"
      ])
    } else if (role == "sup"){
      setMainChampions([
        "アリスター",
        "エリス",
        "カルマ",
        "ザイラ",
        "ジリアン",
        "ジャンナ",
        "スウェイン",
        "スレッシュ",
        "ソナ",
        "ソラカ",
        "タム・ケンチ",
        "タリック",
        "ナミ",
        "ニーコ",
        "ノーチラス",
        "バード",
        "パイク",
        "パンテオン",
        "フィドルスティックス",
        "ブラウム",
        "ブランド",
        "ブリッツクランク",
        "ポッピー",
        "マオカイ",
        "ミリオ",
        "メル",
        "ラックス",
        "ラカン",
        "ルブラン",
        "ルル",
        "レオナ",
        "レナータ・グラスク",
        "レル",
        "ヴェル＝コズ"
      ])
    } else if (role == "jg"){
      setMainChampions([
        "アイバーン",
        "イブリン",
        "ウディア",
        "エコー",
        "カ＝ジックス",
        "キヤナ",
        "キンドレッド",
        "グウェン",
        "グレイブス",
        "ケイン",
        "ザイラ",
        "ザック",
        "サイラス",
        "シン・ジャオ",
        "ジャックス",
        "ジャーヴァンⅣ",
        "ダイアナ",
        "タロン",
        "ヌヌ＆ウィルンプ",
        "ニダリー",
        "フィドルスティックス",
        "ブライアー",
        "ベル＝ヴェス",
        "ヘカリム",
        "ポッピー",
        "ボリベア",
        "マスター・イー",
        "リー・シン",
        "レク＝サイ",
        "ワーウィック",
        "ヴィエゴ"
      ])
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
    <div className="container">
      {role == "" && (<h1>マッチアップクイズ</h1>)}
      {role != "" && (<h1>マッチアップクイズ({role})</h1>)}
        
      {/* アプリの説明 */}
      {stage === "role" && (
        <p className="description">
          League of Legendsのマッチアップクイズです。 <br></br>
          チャンピオンの有利不利を学習する練習にお使いください。  <br></br>
          まずはロールを選択してください。
        </p>
      )}

      {/* ロール選択画面 */}
      {stage === "role" && (
        <div>
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="">未選択</option>
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
          <Button className="mt-6" onClick={onBack}>
            ← メニューに戻る
          </Button>
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

      {stage === "quiz" && role !== "bot&sup" && <Quiz role={role} mainChampion={mainChampion} round={round} onEnd={handleQuizEnd}  />}
      {stage === "quiz" && role === "bot&sup" && <QuizBotSup role={role} mainChampion={mainChampion} onEnd={handleQuizEnd} />}

      {stage === "result" && (
        <div>
          <div>
            <h2>結果: {score} / 10 </h2>
            <button onClick={handleRetry}>再挑戦</button>
          </div>
          <TweetButton role={role} mainChampion={mainChampion} score={score+" / 10"} gameUrl="https://nitamago.github.io/lol-matchup-quiz/" />
          <div>
            <button onClick={handleMoveRoleSelect}>ロール選択へ</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
