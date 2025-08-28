import { useState, useEffect } from "react";

interface Matchups {
  [key: string]: {
    beats: string[];
    loses: string[];
  };
}

interface ChampionInfo {
  [key: string]: {
    name: string;
    icon: string;
  };
}

interface QuizProps {
  role: string;
  mainChampion: string;
  onEnd: (score: number) => void;
}

export default function Quiz({ role, mainChampion, onEnd }: QuizProps) {
  const [matchups, setMatchups] = useState<Matchups>({});
  const [champions, setChampions] = useState<ChampionInfo>({});
  const [round, setRound] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 両方の JSON を読み込む
  useEffect(() => {
    Promise.all([
      fetch("/lol-matchup-quiz/"+role+"_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/champions.json").then((res) => res.json()),
    ]).then(([matchupData, championData]) => {
      setMatchups(matchupData);
      setChampions(championData);
      startRound(matchupData);
    });
  }, []);

  const startRound = (data: Matchups = matchups) => {
    if (round >= 10 || Object.keys(data).length === 0) return;
    setSelected(null);
    setIsCorrect(null);

    let opponentChampion: string; 
    if (mainChampion && data[mainChampion]) { 
      if (round < 6) { 
        // 選択肢にメインチャンプがくる問題 
        if (Math.random() > 0.5) { 
          const possibleOpponents = Object.keys(data).filter((c) => data[c].loses.includes(mainChampion)); 
          opponentChampion = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)]; 
        } else { 
          const possibleOpponents = Object.keys(data).filter((c) => data[c].beats.includes(mainChampion)); 
          opponentChampion = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)]; 
        } 
      } else { 
        // 相手にメインチャンプがくる問題 
        opponentChampion = mainChampion; 
      } 
    } else { 
      // 未選択なら完全ランダム 
      const champions = Object.keys(data); 
      opponentChampion = champions[Math.floor(Math.random() * champions.length)]; 
    }
    setOpponent(opponentChampion); 
    console.log('Opponent:', opponentChampion);
    
    // プレイヤー選択肢は mainChampion の勝ち・負け関係で決定 
    let advantage: string; 
    let disadvantage: string; 
    if (mainChampion && data[mainChampion]) { 
      if (data[opponentChampion].loses.includes(mainChampion)){ 
        advantage = mainChampion; 
      } else { 
        const champions = data[opponentChampion].loses; 
        advantage = champions[Math.floor(Math.random() * champions.length)]; 
      } 
      if (data[opponentChampion].beats.includes(mainChampion)){ 
        disadvantage = mainChampion; 
      } else { 
        const champions = data[opponentChampion].beats; 
        disadvantage = champions[Math.floor(Math.random() * champions.length)]; 
      } 
    } else { 
      // 未選択時は従来通り 
      const loseChampions = data[opponentChampion].loses; 
      advantage = loseChampions[Math.floor(Math.random() * loseChampions.length)]; 
      const beatChampions = data[opponentChampion].beats; 
      disadvantage = beatChampions[Math.floor(Math.random() * beatChampions.length)]; 
    }
    console.log('Advantage:', advantage, 'Disadvantage:', disadvantage);

    setChoices([advantage, disadvantage].sort(() => Math.random() - 0.5));
  };

  const handleChoice = (choice: string) => {
    if (!opponent || selected) return;
    setSelected(choice);
    const correct = matchups[opponent].loses.includes(choice);
    setIsCorrect(correct);
  };

  const nextRound = () => {
    if (!opponent || selected === null) return;
    const newHistory = [...history, isCorrect ? 1 : 0];
    setHistory(newHistory);

    if (round + 1 >= 10) {
      onEnd(newHistory.reduce((a, b) => a + b, 0));
    } else {
      setRound(round + 1);
      startRound();
    }
  };

  if (Object.keys(matchups).length === 0 || Object.keys(champions).length === 0) {
    return <p>読み込み中...</p>;
  }

  return (
    <div>
      <h2>ラウンド: {round + 1} / 10</h2>

      {/* 履歴 */}
      <div id="history">
        {history.map((x, i) => (
          <img
            key={i}
            src={x === 1 ? "/lol-matchup-quiz/icons/maru.png" : "/lol-matchup-quiz/icons/batsu.png"}
            alt={x === 1 ? "正解" : "不正解"}
            width={24}
            style={{ marginRight: "4px" }}
          />
        ))}
      </div>

      {opponent && (
        <div>
          <h3>相手のチャンピオン</h3>
          <div className="champion">
            <img src={champions[opponent]?.icon} alt={opponent} width={64} />
            <div>{opponent}</div>
          </div>
        </div>
      )}

      <h3>有利な方を選択</h3>
      <div className="choicesRow">
        {choices.map((c) => (
          <div
            key={c}
            className={`champion ${
              selected === c ? (isCorrect ? "correct" : "wrong") : ""
            }`}
            onClick={() => handleChoice(c)}
          >
            <img src={champions[c]?.icon} alt={c} width={64} />
            <div>{c}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div>
          <img
            src={isCorrect ? "/lol-matchup-quiz/icons/maru.png" : "/lol-matchup-quiz/icons/batsu.png"}
            alt={isCorrect ? "正解" : "不正解"}
            width={64}
            style={{ display: "block", margin: "1rem auto" }}
          />
          <button onClick={nextRound}>次へ</button>
        </div>
      )}
    </div>
  );
}
