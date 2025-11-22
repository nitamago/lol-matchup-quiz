import { useState, useRef, useEffect } from "react";
import HyphenList from "./HyphenList";
import WinRateChart from "./Chart";

type ExplainPageProps = {
  onBack: () => void;
};

interface Matchups {
  [key: string]: {
    beats: { [key: string]: string }[];
    loses: { [key: string]: string }[];
    even_list: { [key: string]: string }[];
    origins: { [key: string]: string }[];
    url: string;
  };
}

interface Reasons {
  [key: string]: {
    beats: { [key: string]: string };
    loses: { [key: string]: string };
    even_list: { [key: string]: string };
  };
}

interface ChampionInfo {
  [key: string]: {
    name: string;
    icon: string;
  };
}

export default function ExplainPage({ onBack }: ExplainPageProps) {
  const [roleInput, setRoleInput] = useState("");
  const [champ1Input, setChamp1Input] = useState("");
  const [champ2Input, setChamp2Input] = useState("");

  // 確定用 state
  const [role, setRole] = useState("");
  const [champ1, setChamp1] = useState("");
  const [champ2, setChamp2] = useState("");
  
  const [advantage, setAdvantage] = useState<string>("");
  const [disadvantage, setDisadvantage] = useState<string>("");
  const [advantageDelta2, setAdvantageDelta2] = useState<string>("0.0");
  const [disadvantageDelta2, setDisadvantageDelta2] = useState<string>("0.0");

  // 更新ボタンで表示する部分の state
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [adReason, setAdReason] = useState<string[]>([]);
  const [disadReason, setDisadReason] = useState<string[]>([]);
  const [origins, setOrigins] = useState<any[]>([]);
  const [opponentName, setOpponentName] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [matchups, setMatchups] = useState<Matchups>({});
  const [reason, setReason] = useState<string>("");
  const [champions, setChampions] = useState<ChampionInfo>({});

  const explanationRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const translateMap = useRef<Record<string, string>>({});
  const translateMapRev = useRef<Record<string, string>>({});
  const roleBefore = useRef<string>("");
  const matchupJsonData = useRef<Matchups>({});
  const reasonJsonData = useRef<Reasons>({});

  useEffect(() => {
      const lang = localStorage.getItem("lang") || "en";
      Promise.all([
        fetch("/lol-matchup-quiz/lol-matchup-quiz/ja/champions.json").then((res) => res.json()),
        fetch("/lol-matchup-quiz/lol-matchup-quiz/"+lang+"/name_to_ja_map.json").then((res) => res.json()),
      ]).then(([championData, translateJson]) => {
        setChampions(championData);
        translateMap.current = translateJson;
        translateMapRev.current = Object.fromEntries(
          Object.entries(translateJson).map(([key, value]) => [value, key])
        );
        console.log('translateMapRev.current', translateMapRev.current);
      });
    }, []);

  const handleUpdate = async () => {
    // 入力値を確定
    setRole(roleInput);
    setChamp1(champ1Input);
    setChamp2(champ2Input);
    
    try {
      if (roleBefore.current !== role) {
        const matchupJsonPath = `/lol-matchup-quiz/lol-matchup-quiz/ja/${role}_matchups.json`;
        console.log('matchupJsonPath:', matchupJsonPath);
        const reasonJsonPath = `/lol-matchup-quiz/lol-matchup-quiz/ja/${role}_reason.json`;
        console.log('reasonJsonPath:', reasonJsonPath);

        const matchupResponse = await fetch(matchupJsonPath);
        const reasonResponse = await fetch(reasonJsonPath);
        if (!(matchupResponse.ok && reasonResponse.ok)) {
          alert("データが見つかりません");
          return;
        }
        matchupJsonData.current = await matchupResponse.json();
        console.log('matchupJsonData:', matchupJsonData.current);
        reasonJsonData.current = await reasonResponse.json();
        console.log('reasonJsonData:', reasonJsonData.current);

        roleBefore.current = role;
      }

      const matchupData = matchupJsonData.current;
      const reasonData = reasonJsonData.current;

      setOrigins(matchupData[champ1].origins);
      setOpponentName(champ1);
      setDataUrl(matchupData[champ1].url);

      const matchupRow = matchupData[champ1];
      console.log('matchupRow:', matchupRow);
      const row = reasonData[champ1];
      console.log('row:', row);

      if (champ2 in row['beats']) {
        console.log(`${champ2} は ${champ1} に不利`);
        const reason = row['beats'][champ2]; 
        console.log("reason:", reason);
        setReason(reason);

        const ad = matchupRow.loses[0];
        setAdvantage(ad["name"]);
        setAdvantageDelta2(ad["delta2"]);

        setDisadvantage(champ2);
        const disad = matchupRow.beats.filter(item => item.name === champ2)[0];
        setDisadvantageDelta2(disad["delta2"]);
      } else if (champ2 in row['loses']) {
        console.log(`${champ2} は ${champ1} に有利`);
        const reason = row['loses'][champ2]; 
        console.log("reason:", reason);
        setReason(reason);

        setAdvantage(champ2);
        const ad = matchupRow.loses.filter(item => item.name === champ2)[0];
        setAdvantageDelta2(ad["delta2"]);

        const disad = matchupRow.beats[0];
        setDisadvantage(disad["name"]);
        setDisadvantageDelta2(disad["delta2"]);
      }  else if (champ2 in row['even_list']) {
        console.log(`${champ2} は ${champ1} と互角`);
        const reason = row['even_list'][champ2]; 
        console.log("reason:", reason);
        setReason(reason);

        setAdvantage(champ2);
        const ad = matchupRow.even_list.filter(item => item.name === champ2)[0];
        setAdvantageDelta2(ad["delta2"]);

        const disad = matchupRow.even_list[0];
        setDisadvantage(disad["name"]);
        setDisadvantageDelta2(disad["delta2"]);
      } else {
        console.log(`${champ1} vs ${champ2} のデータは存在しない`);
      }

      setShowResult(true);

      const saveChartWithEmbeddedImages = async (role: string, opponentName: string, selected: string) => {
        if (!chartRef.current) return; // ここで null を弾く

        try {
          // const htmlContent = await exportChartAsHtml(explanationRef.current!, chartRef.current!);
          
          // 現在の画面をまるごと HTML として取得
          let htmlContent = `
          <!DOCTYPE html>
          ${document.documentElement.outerHTML}
          `;
          htmlContent = htmlContent.replace('<title>マッチアップクイズ</title>', '<title> LoL '+opponentName+" vs "+selected+" 相性 カウンター 対策"+'</title>'); 
          htmlContent = htmlContent.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<meta name="description" content="League of Legendsの'+opponentName+' vs '+selected+'の相性について説明します。">'); 
          
          htmlContent = htmlContent.replace(/\/lol-matchup-quiz\//g, "https://nitamago.github.io/lol-matchup-quiz/"); 
          htmlContent = htmlContent.replace('<div style="margin-top: 10px;"><button class="update-explain" style="margin-right: 10px;">更新</button></div>', ""); 
          htmlContent = htmlContent.replace('<h2>Explain Page</h2>', '<h2>チャンピオン相性辞書は<a href="https://loldictionary.win/" target="_blank">こちら</a></h2>')
          htmlContent = htmlContent.replace('<label>Role:<input type="text" value="'+role+'" style="margin-left: 8px;"></label>', '')
          htmlContent = htmlContent.replace('<label>Champion 1:<input type="text" value="'+champ1+'" style="margin-left: 8px;"></label>', '')
          htmlContent = htmlContent.replace('<label>Champion 2:<input type="text" value="'+champ2+'" style="margin-left: 8px;"></label>', '')
          htmlContent = htmlContent.replace('G-MVL5C35764', ''); // GA ID 変更
          htmlContent = htmlContent.replace('page_view', '')
          
          // 6) Blob にして自動ダウンロード
          const blob = new Blob([htmlContent], { type: "text/html" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `explanation_${role}_${opponentName}_vs_${selected}.html`;
          link.click();
          URL.revokeObjectURL(link.href);
        } catch (err) {
          console.error("保存失敗:", err);
        }
      };

      const delayMs = 1000; // 0.6秒。必要なら 1000〜1500 に増やす
      const id = window.setTimeout(() => {
        void saveChartWithEmbeddedImages(roleInput, champ1, champ2);
      }, delayMs);

      return () => {
        clearTimeout(id);
      };

    } catch (err) {
      console.error(err);
      alert("JSON 読み込みエラー");
    }

    
    // setAdReason( reasonsData[opponentChampion]["loses"][advantageName]);
    // setDisadReason( reasonsData[opponentChampion]["beats"][disadvantageName]);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Explain Page</h2>

      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <div style={{ marginBottom: "8px" }}>
          <label>
            Role:
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              style={{ marginLeft: "8px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>
            Champion 1:
            <input
              type="text"
              value={champ1Input}
              onChange={(e) => setChamp1Input(e.target.value)}
              style={{ marginLeft: "8px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>
            Champion 2:
            <input
              type="text"
              value={champ2Input}
              onChange={(e) => setChamp2Input(e.target.value)}
              style={{ marginLeft: "8px" }}
            />
          </label>
        </div>
      </div>

      <div style={{ marginTop: "10px" }}>
        <button className="update-explain" onClick={handleUpdate} style={{ marginRight: "10px" }}>
          更新
        </button>
      </div>

      {showResult && (
        <div ref={explanationRef} style={{ marginTop: "20px" }}>
            <div>
                <h3>相手のチャンピオン</h3>
                <div className="champion">
                    <img src={champions[champ1]?.icon} alt={champ1} width={64} />
                </div>
                <h3>自分のチャンピオン</h3>
                <div className="champion">
                    <img src={champions[champ2]?.icon} alt={champ2} width={64} />
                </div>
            </div>
        
            <HyphenList text={reason} />

            <div ref={chartRef}>
                <WinRateChart
                    key={`${champ1}-${champ2}-${advantage}-${disadvantage}-${Date.now()}`}  
                    beat={{ name: advantage, delta2: advantageDelta2 }}
                    lose={{ name: disadvantage, delta2: disadvantageDelta2 }}
                    origins={origins}
                    opponentName={opponentName}
                    url={dataUrl}
                />
            </div>
        </div>
    )}
    </div>
  );
}
