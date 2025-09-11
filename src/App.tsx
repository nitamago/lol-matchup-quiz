// App.tsx
import { useState, useEffect } from "react";
import MainMenu from "./MainMenu";
import QuizGame from "./QuizGame";
import SubChampSuggest from "./SubChampSuggest";
import TitlesPage from "./TitlesPage";
import { useSearchParams, useNavigate  } from "react-router-dom";

export default function App() {
  const [page, setPage] = useState<"menu" | "quiz" | "graph" | "title">("menu");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const screen = searchParams.get("page");
    if (screen=="quiz") {
      setPage(screen);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {page === "menu" && <MainMenu onNavigate={setPage} />}
      {page === "quiz" && <QuizGame onBack={() => {
                            navigate("/lol-matchup-quiz/", { replace: true });
                            setPage("menu");
                          }} />}
      {page === "graph" && <SubChampSuggest onBack={() => setPage("menu")} />}
      {page === "title" && <TitlesPage onBack={() => setPage("menu")} />}
    </div>
  );
}
