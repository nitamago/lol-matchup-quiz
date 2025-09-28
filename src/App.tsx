// App.tsx
import { useState, useEffect } from "react";
import MainMenu from "./MainMenu";
import QuizGame from "./QuizGame";
import SubChampSuggest from "./SubChampSuggest";
import TitlesPage from "./TitlesPage";
import ExplainPage from "./ExplainPage";
import { useSearchParams, useNavigate  } from "react-router-dom";

export default function App() {
  const [page, setPage] = useState<"menu" | "quiz" | "graph" | "title" | "explain">("menu");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const screen = searchParams.get("page");
    if (screen=="quiz") {
      setPage(screen);
    }
  }, [searchParams]);

  useEffect(() => {
    // ページ変更のたびに履歴を積む
    if (page !== "menu") {
      window.history.pushState({ page }, "", "");
    }

    const handlePopState = (event: any) => {
      if (event.state && event.state.page) {
        setPage(event.state.page);
      } else {
        // stateが無い場合はメニューへ
        setPage("menu");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [page]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {page === "menu" && <MainMenu onNavigate={setPage} />}
      {page === "quiz" && <QuizGame onBack={() => {
                            navigate("/lol-matchup-quiz/", { replace: true });
                            setPage("menu");
                          }} />}
      {page === "graph" && <SubChampSuggest onBack={() => setPage("menu")} />}
      {page === "title" && <TitlesPage onBack={() => setPage("menu")} />}
      {page === "explain" && <ExplainPage onBack={() => setPage("menu")} />}
    </div>
  );
}
