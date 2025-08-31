import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import "./Horizontal100BarChart.css";

type Horizontal100BarChartProps = {
  leftImageSrc?: string;
  rightImageSrc?: string;
  data: Record<string, any>[];
  colors?: string[];
  height?: number; // グラフの高さ
  width?: number;  // グラフの幅
  imageSize?: number; // 左右画像のサイズ(px)
};

const DEFAULT_COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#f59e0b", // amber-500
  "#dc2626", // red-600
  "#7c3aed", // violet-600
];

export default function Horizontal100BarChart({
  leftImageSrc,
  rightImageSrc,
  data,
  colors = DEFAULT_COLORS,
  height = 80,
  width = 300,
  imageSize = 56,
}: Horizontal100BarChartProps) {
  const keys = Object.keys(data[0]).filter((k) => k !== "name");
  console.log("Keys:", keys);

  return (
    <div id="h100bar" className="w-full flex items-center gap-4">
      {/* 左画像 */}
      {leftImageSrc && (
        <img
          src={leftImageSrc}
          alt="left"
          className="shrink-0 rounded-2xl shadow-sm"
          style={{ width: imageSize, height: imageSize, objectFit: "contain" }}
        />
      )}

      {/* グラフ本体 */}
      <div className="flex-1" style={{ height, width}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" stackOffset="expand">
            <XAxis type="number" hide domain={[0, 1]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip formatter={(value: number) => `${(value).toFixed(1)}%`} />
            {keys.map((key, idx) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={colors[idx % colors.length]}
              >
                <LabelList
                  dataKey={key}
                  position="center"
                  formatter={(value: number) =>
                    value > 0.05 ? `${(value).toFixed(1)}%` : ""
                  }
                  style={{ fill: "#fff", fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 右画像 */}
      {rightImageSrc && (
        <img
          src={rightImageSrc}
          alt="right"
          className="shrink-0 rounded-2xl shadow-sm"
          style={{ width: imageSize, height: imageSize, objectFit: "contain" }}
        />
      )}
    </div>
  );
}
