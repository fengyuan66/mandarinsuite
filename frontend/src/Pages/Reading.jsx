import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { NEXT_STATUS } from "../common/constants.js";
import HanziWriter from "hanzi-writer";



function Reading(){
    
    const [useCohort, setUseCohort] = useState(true);
    const [manualInput, setManualInput] = useState("");
    const [passage, setPassage] = useState(null)
    const { currentRound, fetchActiveUnit } = useAppContext();

    useEffect(() => {
        fetchActiveUnit();
    }, []);

    function generate(){

        if (useCohort && !currentRound) return;

        const url = useCohort
        ? `http://localhost:8000/generation/reading/${currentRound.id}`
        : `http://localhost:8000/generation/reading-custom`

        const options = useCohort
        ?{method: "POST"}
        :{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(Array.from(manualInput).filter((ch) => ch.trim() !== ""))
        }

        fetch(url, options)
        .then((res) => res.json())
        .then((data) => setPassage(data.passage))

    }

    function reset(){
        setPassage(null)
    }

    return(
        <div>
            <h1>Reading</h1>

            <label>
                <input type="checkbox" checked={useCohort} onChange={(change) => setUseCohort(change.target.checked)} />
            </label>
            {!useCohort &&(
                <input
                    type="text"
                    value={manualInput}
                    onChange={(change)=>setManualInput(change.target.value)}
                />
            )}
            
            <button onClick={generate}>Generate reading</button>
            {passage && <p>{passage}</p>}
            <button onClick={reset}>Reset</button>

        </div>
    )
}

export default Reading