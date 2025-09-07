// CompatibilityGraph.tsx
import { Button } from "@/components/ui/button";
import GraphCytoscape from "./GraphCytoscape";
import { useState, useEffect } from "react";
import { championsByRole } from "./champions";
import { useTranslation } from "react-i18next";
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
    
    const { t } = useTranslation();
  
    useEffect(() => {
        if (stage === "result") {
            if (window.gtag) {
                window.gtag("event", "SubChampSuggest");
            }
        }
    }, []);

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
        if (!mainChampion) return; // メインチャンプが未選択なら進まない
        // 未選択でも進めるのでアラート不要
        setStage("result");

        if (window.gtag) {
            window.gtag("event", "SubChampSuggest");
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">{t("subChamp.title")}</h2>

            {/* ロール選択画面 */}
            {stage === "role" && (
                <div>
                    <p className="description" style={{ whiteSpace: "pre-line" }}>
                        {t("subChamp.description")}
                    </p>
                    <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                        <option value="">{t("quiz.no")}</option>
                        <option value="top">Top</option>
                        <option value="jg">JG</option>
                        <option value="mid">Mid</option>
                        <option value="bot">Bot</option>
                        <option value="sup">Sup</option>
                    </select>
                    <div>
                        <button onClick={handleRoleSelect} disabled={!role}>
                            {t("subChamp.next")}
                        </button>
                    </div>
                </div>
            )}

            {stage === "start" && (
                <div >
                    <h3>{t("subChamp.mainChampSelect")}</h3>
                    <select
                    value={mainChampion}
                    onChange={(e) => setMainChampion(e.target.value)}
                    >
                    <option value="">{t("subChamp.no")}</option>
                    {mainChampions.map((c) => (
                        <option key={c} value={c}>
                        {c}
                        </option>
                    ))}
                    </select>
                    <div>
                    <button onClick={handleStart} className="startButton">
                        {t("subChamp.start")}
                    </button>
                    </div>
                </div>
            )}

            {stage === "result" && (
                <div id='subchamp-fig-container'>
                    <p className="description" style={{ whiteSpace: "pre-line" }}>
                        {t("subChamp.graphDescription")}
                    </p>
                    <p>{t("subChamp.mainChamp")}: {mainChampion} </p>
                    <GraphCytoscape role={role} mainChamp={mainChampion} mode={"type1"}/>
                    <GraphCytoscape role={role} mainChamp={mainChampion} mode={"type2"}/>
                </div>
            )}
            
            <Button className="mt-6" onClick={onBack}>
                {t("subChamp.menu")}
            </Button>

            <Footer />
        </div>
    );
}
