import "./Footer.css";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
        © {new Date().getFullYear()} nitamago.
        <p>
            {t("footer.developer")}: 
            <a href="https://x.com/NitamagoVaingl1" target="_blank" rel="noopener noreferrer">
                @NitamagoVaingl1
            </a>
        </p>
    </footer>
  );
}
