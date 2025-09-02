// CompatibilityGraph.tsx
import { Button } from "@/components/ui/button";
import GraphCytoscape from "./GraphCytoscape";
import { useState, useRef } from "react";
import "./SubChampSuggest.css";
import Footer from "./Footer";

interface Props {
  onBack: () => void;
}

export default function SubChampSuggest({ onBack }: Props) {
    const [role, setRole] = useState<"top" | "mid" | "bot" | "sup" | "jg" | "">("");
    const [stage, setStage] = useState<"role" | "start" | "result">("role");
    const [mainChampion, setMainChampion] = useState<string>(""); // 空文字 = 未選択
    const [mainChampions, setMainChampions] = useState<string[]>([]); // 空文字 = 未選択
  
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
            "ノクターン",
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
        if (!mainChampion) return; // メインチャンプが未選択なら進まない
        // 未選択でも進めるのでアラート不要
        setStage("result");
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">サブチャンピオン提案</h2>

            {/* ロール選択画面 */}
            {stage === "role" && (
                <div>
                    <p className="description">
                    あなたのメインチャンピオンに合わせてサブチャンピオンを提案します。  <br></br>
                    まずはロールを選択してください。
                    </p>
                    <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                        <option value="">未選択</option>
                        <option value="top">Top</option>
                        <option value="jg">JG</option>
                        <option value="mid">Mid</option>
                        <option value="bot">Bot</option>
                        <option value="sup">Sup</option>
                    </select>
                    <div>
                        <button onClick={handleRoleSelect} disabled={!role}>
                        次へ
                        </button>
                    </div>
                </div>
            )}

            {stage === "start" && (
                <div >
                    <h3>メインチャンピオンを選択</h3>
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

            {stage === "result" && (
                <div id='subchamp-fig-container'>
                    <p className="description">
                    矢印でカウンターを表現しています。<br></br>
                    青いゾーンのチャンピオンがサブチャンピオンにおすすめです。<br></br>
                    グラフをドラッグして自由に動かせます。チャンピオン同士の相性を直感的に確認しましょう。
                    </p>
                    <p>メインチャンピオン: {mainChampion} </p>
                    <GraphCytoscape role={role} mainChamp={mainChampion} mode={"type1"}/>
                    <GraphCytoscape role={role} mainChamp={mainChampion} mode={"type2"}/>
                </div>
            )}
            
            <Button className="mt-6" onClick={onBack}>
            ← メニューに戻る
            </Button>

            <Footer />
        </div>
    );
}
