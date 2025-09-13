import { useState, useEffect, useRef, RefObject } from "react";
import WinRateChart from "./Chart";
import HyphenList from "./HyphenList";
import { useTranslation } from "react-i18next";
import "./Quiz.css"

interface Matchups {
  [key: string]: {
    beats: { [key: string]: string }[];
    loses: { [key: string]: string }[];
    origins: { [key: string]: string }[];
    url: string;
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
  round: React.RefObject<number>;
  onEnd: (score: number) => void;
}

export default function Quiz({ role, mainChampion, round, onEnd }: QuizProps) {
  const [matchups, setMatchups] = useState<Matchups>({});
  const [reasons, setReasons] = useState<Reasons>({});
  const [champions, setChampions] = useState<ChampionInfo>({});
  const [roundState, setRound] = useState(0);
  const [opponent, setOpponent] = useState<string>("");
  const [choices, setChoices] = useState<string[]>([]);
  const [history, setHistory] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [adReason, setAdReason] = useState<string>("");
  const [disadReason, setDisadReason] = useState<string >("");
  const [advantage, setAdvantage] = useState<string>("");
  const [disadvantage, setDisadvantage] = useState<string>("");
  const [advantageDelta2, setAdvantageDelta2] = useState<string>("0.0");
  const [disadvantageDelta2, setDisadvantageDelta2] = useState<string>("0.0");
  const [origins, setOrigins] = useState<{[key: string]: string}[]>([]);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [opponentName, setOpponentName] = useState<string>(""); // 空文字 = 未選択

  const beatIndices = useRef(new Set());
  const loseIndices = useRef(new Set());
  const advantageIndices = useRef(new Set());
  const disadvantageIndices = useRef(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const translateMap = useRef<Record<string, string>>({});
  const translateMapRev = useRef<Record<string, string>>({});
  const mainChampionName = useRef<string>("");

  const { t } = useTranslation();

  // 両方の JSON を読み込む
  useEffect(() => {
    const lang = localStorage.getItem("lang") || "en";
    Promise.all([
      fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/"+role+"_matchups.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/"+role+"_reason.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/champions.json").then((res) => res.json()),
      fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/name_to_ja_map.json").then((res) => res.json()),
    ]).then(([matchupData, reasonData, championData, translateJson]) => {
      setMatchups(matchupData);
      setReasons(reasonData);
      setChampions(championData);
      translateMap.current = translateJson;
      translateMapRev.current = Object.fromEntries(
        Object.entries(translateJson).map(([key, value]) => [value, key])
      );
      console.log('translateMapRev.current', translateMapRev.current)
      startRound(matchupData, reasonData);
    });
  }, []);

  useEffect(() => {
    window.gtag("event", "Round"+round.current);
  }, [roundState]);

  useEffect(() => {
    console.log(containerRef.current)
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selected]);

  
  const translateChanmpName = (nameStr: string|null) => {
    if (nameStr) {
      console.log('nameStr', nameStr)
      return translateMap.current[nameStr];
    } else {
      return "";
    }
  }

  const startRound = (data: Matchups = matchups, reasonsData: Reasons = reasons) => {
    if (round.current >= 11 || Object.keys(data).length === 0) {
      loseIndices.current = new Set();
      beatIndices.current = new Set();
      return;
    }
    setSelected(null);
    setIsCorrect(null);
    setRound(round.current);

    // チャンピオン名を日本語に変換
    console.log(mainChampion)
    mainChampionName.current = translateChanmpName(mainChampion);

    let opponentChampion: string; 
    if (mainChampionName.current != "" && data[mainChampionName.current]) { 
      // 選択肢にメインチャンプがくる問題数
      const count1 = Object.keys(data).map((c) => data[c].loses.map((d) => d['name'])).flat().filter((e) => e == mainChampionName.current).flat(); 
      const count2 = Object.keys(data).map((c) => data[c].beats.map((d) => d['name'])).flat().filter((e) => e == mainChampionName.current).flat();
      
      if (round.current <= Math.min(6, count1.length+count2.length+1)) {    
        // 事前に2パターンのインデックスを抽選
        const possibleOpponents = Object.keys(data).filter((c) => data[c].loses.map((d) => d['name']).includes(mainChampionName.current)); 
        let index = Math.floor(Math.random() * possibleOpponents.length);
        let count = 0;
        while (loseIndices.current.has(index) && count < 100) {
          index = Math.floor(Math.random() * possibleOpponents.length);
          count += 1;
        }

        const possibleOpponents2 = Object.keys(data).filter((c) => data[c].beats.map((d) => d['name']).includes(mainChampionName.current)); 
        let index2 = Math.floor(Math.random() * possibleOpponents2.length);
        let count2 = 0;
        while (beatIndices.current.has(index2) && count2 < 100) {
          index2 = Math.floor(Math.random() * possibleOpponents2.length);
          count2 += 1;
        }
        
        // 選択肢にメインチャンプがくる問題 
        if (possibleOpponents.length-loseIndices.current.size <0) {
          beatIndices.current.add(index2);
          opponentChampion = possibleOpponents2[index2]; 
        } else if (possibleOpponents2.length-beatIndices.current.size <0) {
          loseIndices.current.add(index);
          opponentChampion = possibleOpponents[index];
        } else if (Math.random() > 0.5) {           
          loseIndices.current.add(index);
          opponentChampion = possibleOpponents[index]; 
        } else {                   
          beatIndices.current.add(index2);
          opponentChampion = possibleOpponents2[index2]; 
        } 
      } else { 
        // 相手にメインチャンプがくる問題 
        opponentChampion = mainChampionName.current; 
      } 
    } else { 
      // 未選択なら完全ランダム 
      const champions = Object.keys(data); 
      opponentChampion = champions[Math.floor(Math.random() * champions.length)]; 
    }    

    setOpponent(opponentChampion); 
    setOpponentName(translateMapRev.current[opponentChampion]); 
    console.log('Opponent:', opponentChampion);
    console.log('OpponentName:', translateMapRev.current[opponentChampion]);
    if (translateMapRev.current[opponentChampion] === undefined) {
      alert(opponentChampion+": 値が存在しません！");
    }

    // 参照URLセット
    setDataUrl(data[opponentChampion].url);
    
    const origins: { [key: string]: string }[] = data[opponentChampion].origins;
    setOrigins(origins);
    console.log('Origins:', origins);
    
    // プレイヤー選択肢は mainChampion の勝ち・負け関係で決定 
    let advantageName: string; 
    let disadvantageName: string;
    let advantageDelta2: string; 
    let disadvantageDelta2: string;
    if (mainChampionName.current && data[mainChampionName.current] ) { 
      if (data[opponentChampion].loses.map((d) => d['name']).includes(mainChampionName.current)){ 
        const advantageData = data[opponentChampion].loses.filter((d) => d['name'] === mainChampionName.current)[0]
        advantageName = advantageData['name'];
        advantageDelta2 = advantageData['delta2'];
      } else { 
        const champions = data[opponentChampion].loses; 
        let index = Math.floor(Math.random() * champions.length);
        let count = 0;
        while (advantageIndices.current.has(index) && count < 100) {
          index = Math.floor(Math.random() * champions.length);
          count += 1;
        }
        advantageIndices.current.add(index);
        const advantageData = champions[index];
        advantageName = advantageData['name'];
        advantageDelta2 = advantageData['delta2'];
      } 
      if (data[opponentChampion].beats.map((d) => d['name']).includes(mainChampionName.current)){ 
        const disadvantageData = data[opponentChampion].beats.filter((d) => d['name'] === mainChampionName.current)[0];
        disadvantageName = disadvantageData['name'];
        disadvantageDelta2 = disadvantageData['delta2'];
      } else { 
        const champions = data[opponentChampion].beats; 
        let index = Math.floor(Math.random() * champions.length);
        let count = 0;
        while (disadvantageIndices.current.has(index) && count < 100) {
          index = Math.floor(Math.random() * champions.length);
          count += 1;
        }
        disadvantageIndices.current.add(index);
        const disadvantageData = champions[index]
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
    console.log("History:", newHistory);

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

      {opponent && (
        <div>
          <h3>{t("quiz.opponent")}</h3>
          <div className="champion">
            <img src={champions[opponent]?.icon} alt={opponent} width={64} />
            {(localStorage.getItem("lang")==="ja")&& <div>{opponent}</div>}
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
            <img src={champions[c]?.icon} alt={c} width={64}/>
            {(localStorage.getItem("lang")==="ja")&& <div>{c}</div>}
            
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
          {isCorrect ? <HyphenList text={adReason}/> : <HyphenList text={disadReason}/>}
          
          <WinRateChart beat={{"name": advantage, "delta2": advantageDelta2}} lose={{"name": disadvantage, "delta2": disadvantageDelta2}} 
                        origins={origins} opponentName={opponentName} url={dataUrl}/>

          <button id="next-button" onClick={nextRound} tabIndex={-1}>{t("quiz.next")}</button>
        </div>
      )}
    </div>
  );
}
