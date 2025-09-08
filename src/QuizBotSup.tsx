import { useState, useEffect, useRef } from "react";
import WinRateChart from "./Chart";
import Horizontal100BarChart from "./Horizontal100BarChart";
import { useTranslation } from "react-i18next";
import "./QuizBotSup.css"

interface Matchups {
  [key: string]: {
    beats: { [key: string]: string }[];
    loses: { [key: string]: string }[];
    origin: { [key: string]: string }[];
    url1: string;
    url2: string;
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
  round: React.RefObject<number>;
  onEnd: (score: number) => void;
}

export default function QuizBotSup({ role, mainChampion, round, onEnd }: QuizProps) {
  const [matchups, setMatchups] = useState<Matchups>({});
  const [botMatchups, setBotMatchups] = useState<Matchups>({});
  const [supMatchups, setSupMatchups] = useState<Matchups>({});
  const [champions, setChampions] = useState<ChampionInfo>({});
  const [roundState, setRound] = useState(0);
  const [opponentChampionKey, setOpponentChampionKey] = useState<string | null>(null);
  const [opponentBot, setOpponentBot] = useState<string>("");
  const [opponentSup, setOpponentSup] = useState<string>("");
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
  const [quizType, setQuizType] = useState<string>("");
  const [dataUrl1, setDataUrl1] = useState<string>("");
  const [dataUrl2, setDataUrl2] = useState<string>("");


  const quizIndices = useRef(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();


  // 両方の JSON を読み込む
  useEffect(() => {
    const lang = localStorage.getItem("lang") || "en";
    Promise.all([
      fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/bot&sup_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/sup&bot_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/bot_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/sup_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/champions.json").then((res) => res.json()),
    ]).then(([matchupData1, matchupData2, botMatchupData, supMatchups, championData]) => {
      const merged = { ...matchupData1, ...matchupData2 };
      setMatchups(merged);
      setBotMatchups(botMatchupData);
      setSupMatchups(supMatchups);
      setChampions(championData);
      startRound(merged, botMatchupData, supMatchups);
    });
  }, []);
  
  useEffect(() => {
    window.gtag("event", "Round"+round.current);
  }, [roundState]);

  const startRound = (data: Matchups = matchups, data2: Matchups = botMatchups, data3: Matchups = supMatchups) => {
    if (round.current >= 11 || Object.keys(data).length === 0) return;
    setSelected(null);
    setIsCorrect(null);
    setRound(round.current);
    
    // 未選択なら完全ランダム 
    const champions = Object.keys(data); 
    let index = Math.floor(Math.random() * champions.length);
    let count = 0;
    while (quizIndices.current.has(index) && count < 100) {
      index = Math.floor(Math.random() * champions.length);
      count += 1;
    }
    const key = champions[index]; 
    console.log('key:', key);
    setOpponentChampionKey(key);
    const champs = key.split(',');

    const opBot: string = champs[0];
    const opSup: string = champs[1];
    const tmBot: string = champs[2];
    setOpponentBot(opBot); 
    setOpponentSup(opSup); 
    setTeamBot(tmBot); 

    const quizType: string = champs[3];
    setQuizType(quizType);

    if (quizType == "sup") {
      const botMatchup = data2[opBot].loses.filter(c => c['name'] == tmBot)[0];
      const botDelta2 = parseFloat(botMatchup ? botMatchup['delta2'] : "0.0"); // losesにないということは互角であるはず
      setH100BarData([{'name': "A", tmBot: 50-botDelta2, opBot: 50+botDelta2 }])
    }
    else if (quizType == "bot") {
      const supMatchup = data3[opSup].loses.filter(c => c['name'] == tmBot)[0];
      const supDelta2 = parseFloat(supMatchup ? supMatchup['delta2'] : "0.0"); // losesにないということは互角であるはず
      setH100BarData([{'name': "A", tmBot: 50-supDelta2, opSup: 50+supDelta2 }])
    }
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

    // 参照URLセット
    setDataUrl1(data[key].url1);
    setDataUrl2(data[key].url2);
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

    round.current += 1;
    if (round.current >= 11) {
      onEnd(newHistory.reduce((a, b) => a + b, 0));
    } else {
      setRound(round.current);
      startRound();
    }
  };

  if (Object.keys(matchups).length === 0 || Object.keys(champions).length === 0) {
    return <p>{t("quiz.loading")}</p>;
  }

  return (
    <div ref={containerRef} key={roundState}>
      <h2>{t("quiz.round")}: {roundState} / 10</h2>

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
          <h3>{t("quiz.opponent")}</h3>
          <div className="champions">
            <div className="champion">
              <img src={champions[opponentBot]?.icon} alt={opponentBot} width={64} />
              {(localStorage.getItem("lang")==="ja")&& <div>{opponentBot}</div>}
            </div>
            <div className="champion">
              <img src={champions[opponentSup]?.icon} alt={opponentSup} width={64} />
              {(localStorage.getItem("lang")==="ja")&& <div>{opponentSup}</div>}
            </div>
          </div><h3>{t("quiz.teammate")}</h3>
          <div className="champions">
            <div className="champion">
              <img src={champions[teamBot]?.icon} alt={teamBot} width={64} />
              {(localStorage.getItem("lang")==="ja")&& <div>{teamBot}</div>}
            </div>
          </div>
        </div>
      )}

      <h3>{t("quiz.choose")}</h3>
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
            {(localStorage.getItem("lang")==="ja")&& <div>{c}</div>}
          </div>
        ))}
      </div>

      {selected && opponentBot && teamBot && quizType == "sup" && (
        <div>
          <img
            src={isCorrect ? "/lol-matchup-quiz/icons/maru.png" : "/lol-matchup-quiz/icons/batsu.png"}
            alt={isCorrect ? "正解" : "不正解"}
            width={64}
            style={{ display: "block", margin: "1rem auto" }}
          />
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">{t("quiz.botWinRate")}</h2>
            <Horizontal100BarChart
              leftImageSrc={champions[teamBot]?.icon}
              rightImageSrc={champions[opponentBot]?.icon}
              data={h100BarData} url={dataUrl1}
            />
          </div>
          <WinRateChart beat={{"name": advantage, "delta2": advantageDelta2}} lose={{"name": disadvantage, "delta2": disadvantageDelta2}} 
                        origins={origins} opponentName={opponentSup} url={dataUrl2}/>
          <button onClick={nextRound}>{t("quiz.next")}</button>
        </div>
      )}

      {selected && opponentSup && teamBot && quizType == "bot" && (
        <div>
          <img
            src={isCorrect ? "/lol-matchup-quiz/icons/maru.png" : "/lol-matchup-quiz/icons/batsu.png"}
            alt={isCorrect ? "正解" : "不正解"}
            width={64}
            style={{ display: "block", margin: "1rem auto" }}
          />
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">{t("quiz.supWinRate")}</h2>
            <Horizontal100BarChart
              leftImageSrc={champions[teamBot]?.icon}
              rightImageSrc={champions[opponentSup]?.icon}
              data={h100BarData} url={dataUrl1}
            />
          </div>
          <WinRateChart beat={{"name": advantage, "delta2": advantageDelta2}} lose={{"name": disadvantage, "delta2": disadvantageDelta2}} 
                        origins={origins} opponentName={opponentBot} url={dataUrl2}/>
          <button id="next-button" onClick={nextRound}>{t("quiz.next")}</button>
        </div>
      )}
    </div>
  );
}
