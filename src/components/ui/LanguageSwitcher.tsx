// components/LanguageSwitcher.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css"

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng); // 選択を保存
  };

  return (
    <div className="translate-select-wrapper">
      <select
        className="translate-select"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {/* <option value="cn">简体中文</option> */}
        <option value="en">English</option>
        <option value="ja">日本語</option>
        {/* <option value="kr">한국어</option> */}
      </select>
    </div>
  );
};

;
