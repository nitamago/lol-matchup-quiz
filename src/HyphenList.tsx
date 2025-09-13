import { useState, useEffect } from "react";
import React from "react";
import './HyphenList.css'

type Props = { text: string };

export default function HyphenList({ text }: Props) {
  const[beforeList, setBeforeList] = useState<String>("");

  useEffect(() => {
    setBeforeList(text.split('-')[0])
  })

  
  // 文字列を段落ごとに分割
  const sections = text.split("\n\n").map((x) => x.split(':\n')).flat().map((x) => x.split('：\n')).flat();
  console.log("Sections:", sections)
  // 呼び出し側で beforeList を足す
  return (
    <div className="analysis-container">
      {sections.map((section, index) => {
        if (section.trim().startsWith("-")) {
          // リスト部分（行ごとに - で始まる）
          const items = section.split("\n").map((line) => line.replace(/^- /, "").trim());
          return (
            <ul key={index} className="hyphen-list">
              {items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        } else {
          // 見出しと段落を分ける（"理由は以下の通りです。" などは h3 扱いにすると見やすい）
          if (index === 0) {
            return <h3 key={index}>{section}</h3>;
          } else if (section.includes("リード") ||section.endsWith("です。") || section.endsWith("あります。")) {
            return <h4 key={index}>{section}</h4>;
          } else {
            return <p key={index}>{section}</p>;
          }
        }
      })}
    </div>
  );
}
