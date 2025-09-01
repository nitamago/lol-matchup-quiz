// App.tsx
import { useState } from "react";
import MainMenu from "./MainMenu";
import QuizGame from "./QuizGame";
import SubChampSuggest from "./SubChampSuggest";

export default function App() {
  const [page, setPage] = useState<"menu" | "quiz" | "graph">("menu");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {page === "menu" && <MainMenu onNavigate={setPage} />}
      {page === "quiz" && <QuizGame onBack={() => setPage("menu")} />}
      {page === "graph" && <SubChampSuggest onBack={() => setPage("menu")} />}
    </div>
  );
}
