import { useState, useEffect } from "react";
import WinRateChart from "./Chart";

interface Matchups {
  [key: string]: {
    beats: { [key: string]: string }[];
    loses: { [key: string]: string }[];
    origins: { [key: string]: string }[];
  };
}
interface Reasons {
  [key: string]: {
    beats: { [key: string]: string };
    loses: { [key: string]: string };
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
  const [reasons, setReasons] = useState<Reasons>({});
  const [champions, setChampions] = useState<ChampionInfo>({});
  const [round, setRound] = useState(0);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [adReason, setAdReason] = useState<string | null>(null);
  const [disadReason, setDisadReason] = useState<string | null>(null);
  const [advantage, setAdvantage] = useState<string>("");
  const [disadvantage, setDisadvantage] = useState<string>("");
  const [advantageDelta2, setAdvantageDelta2] = useState<string>("0.0");
  const [disadvantageDelta2, setDisadvantageDelta2] = useState<string>("0.0");
  const [origins, setOrigins] = useState<{[key: string]: string}[]>([]);

  // 両方の JSON を読み込む
  useEffect(() => {
    Promise.all([
      fetch("/lol-matchup-quiz/"+role+"_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/"+role+"_reason.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/champions.json").then((res) => res.json()),
    ]).then(([matchupData, reasonData, championData]) => {
      setMatchups(matchupData);
      setReasons(reasonData);
      setChampions(championData);
      startRound(matchupData, reasonData);
    });
  }, []);

  const startRound = (data: Matchups = matchups, reasonsData: Reasons = reasons) => {
    if (round >= 10 || Object.keys(data).length === 0) return;
    setSelected(null);
    setIsCorrect(null);

    let opponentChampion: string; 
    if (mainChampion && data[mainChampion]) { 
      if (round < 6) { 
        // 選択肢にメインチャンプがくる問題 
        if (Math.random() > 0.5) { 
          const possibleOpponents = Object.keys(data).filter((c) => data[c].loses.map((d) => d['name']).includes(mainChampion)); 
          opponentChampion = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)]; 
        } else { 
          const possibleOpponents = Object.keys(data).filter((c) => data[c].beats.map((d) => d['name']).includes(mainChampion)); 
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
    
    const origins: { [key: string]: string }[] = data[opponentChampion].origins;
    setOrigins(origins);
    console.log('Origins:', origins);
    
    // プレイヤー選択肢は mainChampion の勝ち・負け関係で決定 
    let advantageName: string; 
    let disadvantageName: string;
    let advantageDelta2: string; 
    let disadvantageDelta2: string;
    if (mainChampion && data[mainChampion] ) { 
      if (data[opponentChampion].loses.map((d) => d['name']).includes(mainChampion)){ 
        const advantageData = data[opponentChampion].loses.filter((d) => d['name'] === mainChampion)[0]
        advantageName = advantageData['name'];
        advantageDelta2 = advantageData['delta2'];
      } else { 
        const champions = data[opponentChampion].loses; 
        const advantageData = champions[Math.floor(Math.random() * champions.length)];
        advantageName = advantageData['name'];
        advantageDelta2 = advantageData['delta2'];
      } 
      if (data[opponentChampion].beats.map((d) => d['name']).includes(mainChampion)){ 
        const disadvantageData = data[opponentChampion].beats.filter((d) => d['name'] === mainChampion)[0];
        disadvantageName = disadvantageData['name'];
        disadvantageDelta2 = disadvantageData['delta2'];
      } else { 
        const champions = data[opponentChampion].beats; 
        const disadvantageData = champions[Math.floor(Math.random() * champions.length)]
        disadvantageName = disadvantageData['name'];
        disadvantageDelta2 = disadvantageData['delta2'];
      } 
    } else { 
      // 未選択時は従来通り 
      const loseChampions = data[opponentChampion].loses; 
      console.log(loseChampions[Math.floor(Math.random() * loseChampions.length)]);
      const advantageData = loseChampions[Math.floor(Math.random() * loseChampions.length)];
      advantageName = advantageData['name'];
      advantageDelta2 = advantageData['delta2'];
      const beatChampions = data[opponentChampion].beats; 
      const disadvantageData = beatChampions[Math.floor(Math.random() * beatChampions.length)];
      disadvantageName = disadvantageData['name'];
      disadvantageDelta2 = disadvantageData['delta2'];
    }
    setAdvantage(advantageName);
    setDisadvantage(disadvantageName);
    setAdvantageDelta2(advantageDelta2);
    setDisadvantageDelta2(disadvantageDelta2);
    console.log('Advantage:', advantageName, 'Disadvantage:', disadvantageName);

    setChoices([advantageName, disadvantageName].sort(() => Math.random() - 0.5));

    console.log('Reasons Data:', reasonsData[opponentChampion]);
    if (reasonsData && reasonsData[opponentChampion]) {
      console.log( reasonsData);
      console.log( reasonsData[opponentChampion]["loses"][advantageName]);
      console.log( reasonsData[opponentChampion]["beats"][disadvantageName]);
      setAdReason( reasonsData[opponentChampion]["loses"][advantageName]);
      setDisadReason( reasonsData[opponentChampion]["beats"][disadvantageName]);
    }
  };

  const handleChoice = (choice: string) => {
    if (!opponent || selected) return;
    setSelected(choice);
    const correct = matchups[opponent].loses.map((d) => d['name']).includes(choice);
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
          <p>{isCorrect ? adReason : disadReason}</p>
          
          <WinRateChart beat={{"name": advantage, "delta2": advantageDelta2}} lose={{"name": disadvantage, "delta2": disadvantageDelta2}} origins={origins}/>

          <button onClick={nextRound}>次へ</button>
        </div>
      )}
    </div>
  );
}
