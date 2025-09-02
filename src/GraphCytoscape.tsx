import { useState, useRef, useMemo, useEffect } from "react";
// GraphCytoscape.tsx
import CytoscapeComponent from "react-cytoscapejs";
import type { Core, Stylesheet, ElementDefinition } from "cytoscape";
import "./GraphCytoscape.css";

interface Matchups {
  [key: string]: {
    beats: { [key: string]: string }[];
    loses: { [key: string]: string }[];
    origins: { [key: string]: string }[];
  };
}

interface ChampionInfo {
  [key: string]: {
    name: string;
    icon: string;
  };
}

type NodeData = { id: string; label: string, img?: string, parent?: string, level: number, index: number};
type EdgeData = { source: string; target: string };

type GraphJson = {
    nodes: NodeData[];
    edges: EdgeData[];
};

const stylesheet = [
    {
        selector: "node",
        style: {
            label: "",
            "background-image": "data(img)", // ノード画像
            color: "#fff",
            "text-valign": "center",
            "text-halign": "center",
            width: 100,   
            height: 100,  
            "border-width": 1,
        },
    },
    {
    selector: ":parent",
        style: {
            "background-color": "#a0e7ff",
            "background-opacity": 0.5,
            "border-width": 2,
            "border-color": "#00aaff",
            padding: 30,
            label: "data(label)",       // ラベル表示
            "text-valign": "top",       // 上部に表示
            "text-halign": "center",    // 中央揃え
            "text-margin-y": -20,      // ノード枠の外に少し移動
            "font-size": 16,
            "font-weight": "bold",
            color: "#ec0202ff"
        }
    },
    {
        selector: "edge",
        style: {
            width: 8, // エッジ線の太さ
            "line-color": "#9aa9b2",
            "curve-style": "bezier",

            "target-arrow-shape": "triangle", // 矢印の形
            "target-arrow-color": "#9aa9b2",
            "target-arrow-scale": 200, // 矢印自体の大きさ
        },
    },
  ];

function shapeData(mainChamp: string, data: Matchups, champions: ChampionInfo, mode: string): GraphJson {
    const result: GraphJson = { nodes: [], edges: [] };
    const champ = data[mainChamp];


    const candidateChamps: { [key: string]: number } = {};
    const rawEdges: EdgeData[] = [];
    let counterChamps: string[] = [];
    let beatChamps: string[] = [];
    if (mode === "type1") {
        result.nodes.push({ id: mainChamp, label: mainChamp, img: champions[mainChamp]?.icon || "" , level: 2, index: 0});

        counterChamps = champ['loses'].map((c) => c['name']);
        counterChamps.forEach((c) => {
            data[c]['loses'].forEach((cc) => {
                if (cc['name'] in candidateChamps) {
                    candidateChamps[cc['name']] += 1;
                } else {
                    candidateChamps[cc['name']] = 1;
                }
                rawEdges.push({ source: cc['name'], target: c });
            });
        });
    } else if (mode === "type2") {
        result.nodes.push({ id: mainChamp, label: mainChamp, img: champions[mainChamp]?.icon || "" , level: 0, index: 0});

        beatChamps = champ['beats'].map((c) => c['name']);
        let i = 0;
        beatChamps.forEach((c) => {
            // result.nodes.push({ id: c, label: c, img: champions[c]?.icon || "", level: 1, index: i++ });
            // result.edges.push({ source: mainChamp, target: c });

            data[c]['loses'].forEach((cc) => {
                if (cc['name'] === mainChamp) return; // メインは除外
                if (cc['name'] in candidateChamps) {
                    candidateChamps[cc['name']] += 1;
                } else {
                    candidateChamps[cc['name']] = 1;
                }
                rawEdges.push({ source: cc['name'], target: c });
            });
        });
    }

    const top5Keys = Object.entries(candidateChamps)
        .sort((a, b) => b[1] - a[1]) // 値で降順
        .slice(0, 5)                 // 上位5つ
        .map(([key]) => key);

    let i = 0;
    if (mode === "type1") {
        counterChamps.forEach((c) => {
            if (top5Keys.includes(c)) return; // top5に入っているものは除外
            result.nodes.push({ id: c, label: c, img: champions[c]?.icon || "", level: 1, index: i++ });
            result.edges.push({ source: c, target: mainChamp });
        });
    } else if (mode === "type2") {
        beatChamps.forEach((c) => {
            if (top5Keys.includes(c)) return; // top5に入っているものは除外
            result.nodes.push({ id: c, label: c, img: champions[c]?.icon || "", level: 1, index: i++ });
            result.edges.push({ source: mainChamp, target: c });
        });
    }

    rawEdges.filter((e) => (top5Keys.includes(e.source))&&(e.target!=mainChamp)&&(!top5Keys.includes(e.target))) // top5のものだけ
        .forEach((e) => result.edges.push(e));
    if (mode === "type1") {
        i = 0;
        top5Keys.forEach((c) => {
            result.nodes.push({ id: c, label: c, img: champions[c]?.icon || "", parent: "zone1", level: 0, index: i++ });
        });
        result.nodes.push({ id: "zone1", label: "zone1", parent: undefined, img: undefined, level: 0, index: 0});
    } else if (mode === "type2") {
        i = 1;
        top5Keys.forEach((c) => {
            result.nodes.push({ id: c, label: c, img: champions[c]?.icon || "", parent: "zone1", level: 0, index: i++ });
        });
        result.nodes.push({ id: "zone1", label: "zone1", parent: undefined, img: undefined, level: 0, index: 2 });
    }
    
    console.log("Candidate Champs:", candidateChamps);
    console.log(result)
    return result;
}

export default function GraphCytoscape({role, mainChamp, mode}: {role: string, mainChamp: string, mode: string}) {
    console.log("Main Champ:", mainChamp);
    const [matchups, setmatchups] = useState<Matchups | null>(null);
    const [champions, setChampions] = useState<ChampionInfo>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/lol-matchup-quiz/"+role+"_matchups.json").then((res) => res.json()),
            fetch("/lol-matchup-quiz/champions.json").then((res) => res.json()),
        ]).then(([matchupData, championData]) => {
            setLoading(true);
            setmatchups(matchupData);
            setChampions(championData);
            setLoading(false);
        })
        .catch((err) => console.error(err));;
    }, []);

    const elements = useMemo(() => {
        if (!matchups) return [];

        const result = shapeData(mainChamp, matchups, champions, mode);
        console.log(result)

        const xMap: { [key: string]: number } = {};
        
        result.nodes.forEach((node) => {
            if ((node.level == 2)||(node.level == 0)) {
                xMap[node.id] = node.index * 150 + Math.floor((100*result.nodes.filter(n=>n.level==1).length)/2);
            } else {
                xMap[node.id] = node.index * 150;
            }
        }); // indexを振り直し

        const nodes = result.nodes.map((node) => ({ 
            data: node, 
            position: { 
                x: xMap[node.id] || 0, 
                y: node.level * 150 
            } 
        }));
        const edges = result.edges.map((edge) => ({ data: edge }));
        console.log(nodes, edges);

        return [...nodes, ...edges];
    }, [matchups]);

    return (
        <div className="bordered-card-container" >
            {mode === "type1" && <p>提案1：不利はカウンターのカウンターで回避！</p>}
            {mode === "type2" && <p>提案2：メインBAN時は代わりのカウンターで有利キープ！</p>}
            <div id='cytoscape-container' className="bordered-card" style={{ width: "100%", height: 300}}>
                {loading ? (
                    <p>Loading...</p>
                ) : (<CytoscapeComponent
                        elements={elements}
                        stylesheet={stylesheet}
                        layout={{name: "preset"}}                
                        style={{ width: "100%", height: "300px" }}
                        cy={(cy: Core) => {
                            cy.ready(() => {
                                // レイアウト完了後に初期ズーム・位置を設定
                                cy.zoom({ level: 0.3, renderedPosition: { x: 0, y: 0 } });
                                cy.center(); // グラフ全体を中央に
                            });
                        }}
                        />
                )}
            </div>
        </div>
    );
}
