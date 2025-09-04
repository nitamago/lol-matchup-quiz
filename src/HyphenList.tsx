import { useState, useEffect } from "react";
import React from "react";
import './HyphenList.css'

type Props = { text: string };

export default function HyphenList({ text }: Props) {
  const[beforeList, setBeforeList] = useState<String>("");

  useEffect(() => {
    setBeforeList(text.split('-')[0])
  })
  
  const lines = text.split(/\r?\n/).filter(Boolean);
  type Node = { children: Node[]; text?: string };

  // ルートとスタックで階層構築
  const root: Node = { children: [] };
  const stack: Node[] = [root];

  for (const line of lines) {
    const m = line.match(/^\s*(-+)\s+(.+)$/);
    if (!m) continue;
    const lvl = m[1].length; // 1=第一階層
    const node: Node = { children: [], text: m[2] };

    // スタック調整
    while (stack.length - 1 > lvl) stack.pop();
    while (stack.length - 1 < lvl) {
      const n: Node = { children: [] };
      stack[stack.length - 1].children.push(n);
      stack.push(n);
    }
    stack[stack.length - 1].children.push(node);
  }

  const render = (n: Node, key?: React.Key): React.ReactNode => {
    if (n.text !== undefined) return <li key={key}>{n.text}</li>;
    if (!n.children.length) return null;
    return (
      <div> 
        <ul key={key} className="hyphen-list">
          {n.children.map((c, i) => render(c, i))}
        </ul>
      </div>
    );
  };

// 呼び出し側で beforeList を足す
return (
  <div>
    <span>{beforeList} </span>
    {render(root)}
  </div>
);
}
