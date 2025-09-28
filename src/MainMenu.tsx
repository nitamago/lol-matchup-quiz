// MainMenu.tsx
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { motion } from "framer-motion";
import Footer from "./Footer";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./MainMenu.css"

interface Props {
  onNavigate: (page: "menu" | "quiz" | "graph" | "title") => void;
}

export default function MainMenu({ onNavigate }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { t } = useTranslation();
  const isDebug = import.meta.env.VITE_DEBUG === 'true';

  useEffect(() => {
    const lang = localStorage.getItem("lang") || "en";
    if (window.gtag) {
      window.gtag("event", "MainMenu");
      window.gtag("event", lang);
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      // iframe 読み込み後にトップへスクロール
      window.scrollTo(0, 0);
    };

    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div>
        {/* メニュー */}
        <motion.div
            className="p-8 bg-white shadow-xl rounded-2xl flex flex-col gap-6 items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
        >
        <LanguageSwitcher></LanguageSwitcher>
        <h1 className="text-2xl font-bold mb-4">{t("menu.title")}</h1>
        <p className="text-lg opacity-90">{t("menu.subTitle")}</p>
        
        <h2 className="text-xl font-bold text-indigo-700">{t("menu.quizMode")}</h2>
        <p className="text-gray-700 mt-2" style={{ whiteSpace: "pre-line" }}>
          {t("menu.quizDescription")}
            
        </p>
        <p>{t("titles.description")}</p>
        <div>
          <Button className="next-button" onClick={() => onNavigate("quiz")}>
            {t("menu.startQuiz")}
          </Button>
          <Button className="next-button" onClick={() => onNavigate("title")}>
            {t("menu.achievement")}
          </Button>
        </div>

        <h2 className="text-xl font-bold text-indigo-700">{t("menu.subChamp")}</h2>
        <p className="text-gray-700 mt-2" style={{ whiteSpace: "pre-line" }}>
          {t("menu.subChampDescription")}
        </p>
        <Button className="next-button"  onClick={() => onNavigate("graph")}>
            {t("menu.findSubChamp")}
        </Button>
        
        {/* フィードバックボタン */}
        <h2 className="text-xl font-bold text-indigo-700 mt-4">{t("menu.feedback")}</h2>
        <p className="text-gray-700 mt-2" style={{ whiteSpace: "pre-line" }}>
          {t("menu.feedbackDescription")}
        </p>
        
        <iframe
          ref={iframeRef}
          src="https://forms.cloud.microsoft/r/cS21bZ0bMP" 
          width="640"
          frameBorder="0"
          marginWidth={0}
          marginHeight={0}
          style={{ border: "none", maxWidth: "100%", maxHeight: "100vh" }}
          tabIndex={-1}
        ></iframe>
        </motion.div>

        
        {/* デバッグボタン */}
        {isDebug && (
          <Button id="explain-button" onClick={() => onNavigate("explain")}>
            explain
          </Button>
        )}

        {/* フッター */}
        <motion.footer> 
            <Footer />
        </motion.footer>
    </div>
  );
}
