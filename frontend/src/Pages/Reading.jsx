import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { NEXT_STATUS } from "../common/constants.js";
import { apiFetch } from "../common/api.js";
import HanziWriter from "hanzi-writer";

import "../css/Reading.css"

function Reading(){
    


    const [isGenerating, setisGenerating] = useState(false);
    const [useCohort, setUseCohort] = useState(true);
    const [manualInput, setManualInput] = useState("");
    const [passage, setPassage] = useState(null)
    const { currentRound, fetchActiveUnit, } = useAppContext();

    useEffect(() => {
        fetchActiveUnit();
    }, []);

    function generate(){

        if (useCohort && !currentRound) return;

        const url = useCohort
        ? `/generation/reading/${currentRound.id}`
        : `/generation/reading-custom`

        const options = useCohort
        ?{method: "POST"}
        :{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(Array.from(manualInput).filter((ch) => ch.trim() !== ""))
        }

        setisGenerating(true)

        apiFetch(url, options)
        .then((res) => res.json())
        .then((data) => setPassage(data.passage))
        .finally(() => setisGenerating(false))

    }

    function reset(){
        setPassage(null)
    }

    return(
        <div>
            <div className="drillpage-core">
                <h1 className="page-title">Reading</h1>
                <p className="page-subtitle">Generate a short passage using your practiced characters.</p>

            </div>

            <div className="controls-bar">
                
                <label className="toggle-label">
                    <input className="toggle" type="checkbox" checked={useCohort} onChange={(change) => setUseCohort(change.target.checked)} />
                    Use characters from current cohort
                </label>
                <button className="btn btn-primary" onClick={generate} disabled={isGenerating}>{isGenerating ? "Generating..." : "Generate reading"}</button>
                <button className="link-quiet" onClick={reset}>Reset</button>
            </div>
                
                {!useCohort &&(
                    <input
                        type="text"
                        className="manual-input"
                        placeholder="Enter your characters here, e.g: 我爱熊猫"
                        value={manualInput}
                        onChange={(change)=>setManualInput(change.target.value)}
                    />
                )}

            
            

            
            {passage && (
                <div className="card passage-card">
                    <p className="passage-text">{passage}</p>
                </div>
            )}
            

        </div>
    )
}

export default Reading