import { useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useTranslation } from "react-i18next";
import "./Chart.css";

// キャラクターデータ型
interface CharacterData {
  name: string;
  winRate: number; // 勝率 (0〜100)
  icon: string;     // 画像URL
}

// サンプルデータ
// const data: CharacterData[] = [
//   { name: "キャラA", winRate: 45, img: "/images/charA.png" },
//   { name: "キャラB", winRate: 60, img: "/images/charB.png" },
//   { name: "キャラC", winRate: 52, img: "/images/charC.png" },
//   { name: "キャラD", winRate: 30, img: "/images/charD.png" },
// ];

// 画像を点として描画するカスタムシェイプ
const ImageShape = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <image
      x={cx + 15}
      y={cy - 15}
      width={30}
      height={30}
      href={payload.icon}
      style={{ borderRadius: "50%" }}
    />
    );
};

interface WinRateChartProps {
    beat: { [key: string]: string };
    lose: { [key: string]: string };
    origins: { [key: string]: string }[];
    opponentName: string;
    url: string;
}

interface CharacterJson {
  [key: string]: {
    name: string;
    icon: string;
  };
}

interface CharacterData {
  name: string;
  icon: string;
  winRate: number;
}

export default function WinRateChart({ beat, lose, origins, opponentName, url }: WinRateChartProps) {
  console.log("Chart Props:", { beat, lose, origins });

  const [figData, setFigData] = useState<CharacterData[]>([]);
  const [range, setRange] = useState<number[]>([]);
  const [opName, setOpName] = useState<string>("");
  
  const { t } = useTranslation();
  

  const winRateMap: Record<string, number> = {};
  winRateMap[beat["name"]] = parseFloat(beat["delta2"]);
  winRateMap[lose["name"]] = parseFloat(lose["delta2"]);
  origins.forEach((o) => {
    winRateMap[o["name"]]= parseFloat(o["delta2"]);
  });

  const nameList = origins.map((o) => o["name"]).flat();
  nameList.push(beat["name"]);
  nameList.push(lose["name"]);

  // JSONから name と img を読み込み、winRateMap と結合
  useEffect(() => {
    fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/champions.json")
      .then((res) => res.json())
      .then((json: CharacterJson) => {
        let merged = Object.values(json).filter((c) => nameList.includes(c["name"]))
        .map((c) => ({
          ...c,
          winRate: (50 - winRateMap[c["name"]]),
        }))
        .sort((a, b) => b.winRate - a.winRate);
        merged.push({winRate: 50, name: "平均", icon: ""}); // 右側の画像が見切れるので、画像無しデータ追加する
        setFigData(merged);
        setRange([Math.floor(Math.min(...merged.map(d => d.winRate)) - 1), Math.ceil(Math.max(...merged.map(d => d.winRate)) + 1)]);
        console.log('opponentName', opponentName);
        setOpName(opponentName);
    })
    .catch((err) => console.error("データ読み込みエラー", err));
  }, []);
  
  // X軸はインデックスを使う
  const chartData = figData.map((d, i) => ({
    x: i,
    y: d.winRate,
    ...d,
  }));
  console.log("Chart Data:", chartData);

  return (
    <div id="fig-container" className="p-4">
      <h2 className="text-xl font-bold mb-4">{t("winrate.winrateGraph")}{opName}</h2>
      <ScatterChart
        width={300}
        height={300}
        margin={{ top: 20, right: 10, bottom: 20, left: 5 }}
      >
        <CartesianGrid />
        <XAxis type="number" dataKey="x" tick={false} label={{ value: t("quiz.champ"), position: "insideBottom" }} />
        <YAxis type="number" dataKey="y" domain={range} interval={0} label={{ value: t("quiz.winRate"), angle: -90, position: "insideLeft" }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <ReferenceLine y={50} stroke="red" strokeDasharray="4 4" label={{value: "50", position: 'left'}}/>
        <Scatter data={chartData} shape={<ImageShape />} />
      </ScatterChart>
      {/* 出典 */}
      {url && (
        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "8px", textAlign: "center" }}>
          {t("winrate.ref")}: LoLalytics <a href={url} target="_blank" rel="noopener noreferrer">
            Delta2(Eme+)
          </a>
        </p>
      )}
    </div>
  );
};
