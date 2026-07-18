import { useState } from "react";
import { useAppContext } from "../common/AppContext.jsx";

function SentenceDictation(){
    const {currentRound} = useAppContext()
    const [useCohort, setUseCohort] = useState(true)
    const [manualInput, setManualInput] = useState("")
    const [content, setContent] = useState(null)

    function generate() {
        const url = useCohort
            ? `http://localhost:8000/generation/writing-dication/${currentRound.id}`
            : `http://localhost:8000/generation/writing-dictation-custom`;

        const options = useCohort
            ? { method: "POST" }
            : {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Array.from(manualInput).filter((ch) => ch.trim() !== "")),
            };

        fetch(url, options)
        .then((res) => res.json())
        .then((data) => setContent(data));
    }

    function reset(){
        setContent(null)
    }

    return(
        <div>
            <h1>Sentence dictation</h1>

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

            <button onClick={generate}>Generate paragraph</button>

            {content && (
                content.skipped
                    ? <p>Skipped: {content.reason}</p>
                    : <p>{content.paragraph}</p>
            )}

            <button onClick={reset}>Reset</button>

        </div>
    )

}

export default SentenceDictation