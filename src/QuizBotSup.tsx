import { useState, useEffect } from "react";

interface Matchups {
  [key: string]: {
    good: string[];
    bad: string[];
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

export default function QuizBotSup({ role, mainChampion, onEnd }: QuizProps) {
  const [matchups, setMatchups] = useState<Matchups>({});
  const [champions, setChampions] = useState<ChampionInfo>({});
  const [round, setRound] = useState(0);
  const [opponentChampionKey, setOpponentChampionKey] = useState<string | null>(null);
  const [opponentBot, setOpponentBot] = useState<string | null>(null);
  const [opponentSup, setOpponentSup] = useState<string | null>(null);
  const [teamBot, setTeamBot] = useState<string | null>(null);
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
    
    // 未選択なら完全ランダム 
    const champions = Object.keys(data); 
    const key = champions[Math.floor(Math.random() * champions.length)]; 
    setOpponentChampionKey(key);
    const champs = key.split(',');

    setOpponentBot(champs[0]); 
    setOpponentSup(champs[1]); 
    setTeamBot(champs[2]); 
    console.log('Opponent Bot:', champs[0], 'Opponent Sup:', champs[1], 'Team Bot:', champs[2]);
    
    // プレイヤー選択肢は mainChampion の勝ち・負け関係で決定 
    let advantage: string; 
    let disadvantage: string; 

    // 未選択時は従来通り 
    const loseChampions = data[key].good; 
    advantage = loseChampions[Math.floor(Math.random() * loseChampions.length)]; 
    const beatChampions = data[key].bad; 
    disadvantage = beatChampions[Math.floor(Math.random() * beatChampions.length)];

    console.log('Advantage:', advantage, 'Disadvantage:', disadvantage);

    setChoices([advantage, disadvantage].sort(() => Math.random() - 0.5));
  };

  const handleChoice = (choice: string) => {
    if (!opponentChampionKey || selected) return;
    setSelected(choice);
    const correct = matchups[opponentChampionKey].good.includes(choice);
    setIsCorrect(correct);
  };

  const nextRound = () => {
    if (!opponentChampionKey || selected === null) return;
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

      {opponentBot && opponentSup && teamBot && (
        <div>
          <h3>相手のチャンピオン</h3>
          <div className="champions">
            <div className="champion">
              <img src={champions[opponentBot]?.icon} alt={opponentBot} width={64} />
              <div>{opponentBot}</div>
            </div>
            <div className="champion">
              <img src={champions[opponentSup]?.icon} alt={opponentSup} width={64} />
              <div>{opponentSup}</div>
            </div>
          </div><h3>味方のチャンピオン</h3>
          <div className="champions">
            <div className="champion">
              <img src={champions[teamBot]?.icon} alt={teamBot} width={64} />
              <div>{teamBot}</div>
            </div>
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
