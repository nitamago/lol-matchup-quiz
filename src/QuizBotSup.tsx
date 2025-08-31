import { useState, useEffect } from "react";
import WinRateChart from "./Chart";
import Horizontal100BarChart from "./Horizontal100BarChart";

interface Matchups {
  [key: string]: {
    beats: { [key: string]: string }[];
    loses: { [key: string]: string }[];
    origin: { [key: string]: string }[];
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
  const [botMatchups, setBotMatchups] = useState<Matchups>({});
  const [champions, setChampions] = useState<ChampionInfo>({});
  const [round, setRound] = useState(0);
  const [opponentChampionKey, setOpponentChampionKey] = useState<string | null>(null);
  const [opponentBot, setOpponentBot] = useState<string | null>(null);
  const [opponentSup, setOpponentSup] = useState<string | null>(null);
  const [teamBot, setTeamBot] = useState<string | null>(null);
  const [advantage, setAdvantage] = useState<string>("");
  const [disadvantage, setDisadvantage] = useState<string>("");
  const [advantageDelta2, setAdvantageDelta2] = useState<string>("0.0");
  const [disadvantageDelta2, setDisadvantageDelta2] = useState<string>("0.0");
  const [origins, setOrigins] = useState<{[key: string]: string}[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [h100BarData, setH100BarData] = useState<Record<string, any>[]>([]);

  const data1 = [
    { name: "A", A: 40, B: 60 }
  ];

  // 両方の JSON を読み込む
  useEffect(() => {
    Promise.all([
      fetch("/lol-matchup-quiz/"+role+"_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/bot_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/champions.json").then((res) => res.json()),
    ]).then(([matchupData, botMatchupData, championData]) => {
      setMatchups(matchupData);
      setBotMatchups(botMatchupData);
      setChampions(championData);
      startRound(matchupData, botMatchupData);
    });
  }, []);

  const startRound = (data: Matchups = matchups, data2: Matchups = botMatchups) => {
    if (round >= 10 || Object.keys(data).length === 0) return;
    setSelected(null);
    setIsCorrect(null);
    
    // 未選択なら完全ランダム 
    const champions = Object.keys(data); 
    const key = champions[Math.floor(Math.random() * champions.length)]; 
    setOpponentChampionKey(key);
    const champs = key.split(',');

    const opBot: string = champs[0]
    const tmBot: string = champs[2]
    console.log('opBot:', data2);
    const botMatchup = data2[opBot].loses.filter(c => c['name'] == tmBot)[0];
    const botDelta2 = parseFloat(botMatchup ? botMatchup['delta2'] : "0.0"); // losesにないということは互角であるはず
    setOpponentBot(opBot); 
    setOpponentSup(champs[1]); 
    setTeamBot(tmBot); 
    setH100BarData([{'name': "A", tmBot: 50-botDelta2, opBot: 50+botDelta2 }])
    console.log('Opponent Bot:', champs[0], 'Opponent Sup:', champs[1], 'Team Bot:', champs[2]);
    
    const origins: { [key: string]: string }[] = data[key].origin;
    setOrigins(origins);

    // プレイヤー選択肢は mainChampion の勝ち・負け関係で決定 
    let advantage: string; 
    let disadvantage: string; 
    let advantageDelta2: string; 
    let disadvantageDelta2: string;

    // 未選択時は従来通り 
    const loseChampions = data[key].loses; 
    const loseChampion = loseChampions[Math.floor(Math.random() * loseChampions.length)];
    advantage = loseChampion['name']; 
    advantageDelta2 = loseChampion['delta2'];
      
    const beatChampions = data[key].beats; 
    const beatChampion = beatChampions[Math.floor(Math.random() * beatChampions.length)];
    disadvantage = beatChampion['name'];
    disadvantageDelta2 = beatChampion['delta2'];

    setAdvantage(advantage);
    setDisadvantage(disadvantage);
    setAdvantageDelta2(advantageDelta2);
    setDisadvantageDelta2(disadvantageDelta2);
    console.log('Advantage:', advantage, 'Disadvantage:', disadvantage);

    setChoices([advantage, disadvantage].sort(() => Math.random() - 0.5));
  };

  const handleChoice = (choice: string) => {
    if (!opponentChampionKey || selected) return;
    setSelected(choice);
    const correct = matchups[opponentChampionKey].loses.map((x) => x['name']).includes(choice);
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

      {selected && opponentBot && teamBot && (
        <div>
          <img
            src={isCorrect ? "/lol-matchup-quiz/icons/maru.png" : "/lol-matchup-quiz/icons/batsu.png"}
            alt={isCorrect ? "正解" : "不正解"}
            width={64}
            style={{ display: "block", margin: "1rem auto" }}
          />
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Bot勝率</h2>
            <Horizontal100BarChart
              leftImageSrc={champions[teamBot]?.icon}
              rightImageSrc={champions[opponentBot]?.icon}
              data={h100BarData}
            />
          </div>
          <WinRateChart beat={{"name": advantage, "delta2": advantageDelta2}} lose={{"name": disadvantage, "delta2": disadvantageDelta2}} origins={origins}/>
          <button onClick={nextRound}>次へ</button>
        </div>
      )}
    </div>
  );
}
