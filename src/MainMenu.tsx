// MainMenu.tsx
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Footer from "./Footer";
import { useEffect } from "react";

interface Props {
  onNavigate: (page: "menu" | "quiz" | "graph") => void;
}

export default function MainMenu({ onNavigate }: Props) {

  useEffect(() => {
    if (window.gtag) {
      window.gtag("event", "MainMenu");
    }
  }, []);

  return (
    <div>
        {/* メニュー */}
        <motion.div
            className="p-8 bg-white shadow-xl rounded-2xl flex flex-col gap-6 items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        >
        <h1 className="text-2xl font-bold mb-4">メインメニュー</h1>
        <p className="text-lg opacity-90">クイズで腕試し & サブチャンプ提案で戦略強化！</p>
        
        <h2 className="text-xl font-bold text-indigo-700">🎯 クイズモード</h2>
        <p className="text-gray-700 mt-2">
            簡単なクイズ形式でチャンピオンの特徴を学べます。  
            自分の知識を試しながら、ゲーム理解を深めましょう！
        </p>
        <Button className="w-48" onClick={() => onNavigate("quiz")}>
            クイズを始める
        </Button>
        <p></p>

        <h2 className="text-xl font-bold text-indigo-700">🤝 サブチャンプ提案</h2>
        <p className="text-gray-700 mt-2">
        あなたのメインチャンピオンと相性の良い「サブチャンプ」を提案します。  
        相性グラフを見ながら、新しい選択肢を見つけてみましょう！
        </p>
        <Button className="w-48" onClick={() => onNavigate("graph")}>
            サブチャンプを探す
        </Button>
        
        {/* フィードバックボタン */}
        <h2 className="text-xl font-bold text-indigo-700 mt-4">💬 フィードバック</h2>
        <p className="text-gray-700 mt-2">
          アプリの改善点や感想をぜひお寄せください！
        </p>
        <Button
          className="w-48"
          onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSf3tuf7J8o3xQgWQQ35Tah_Sb_0XFfjBgLv6gE-gmRPxmSi8w/viewform", "_blank")}
        >
          フィードバックを送る
        </Button>
        </motion.div>

        {/* フッター */}
        <motion.footer> 
            <Footer />
        </motion.footer>
    </div>
  );
}
