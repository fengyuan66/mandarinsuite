import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { NEXT_STATUS } from "../common/constants.js";
import { apiFetch } from "../common/api.js";
import HanziWriter from "hanzi-writer";




function fillInBlanks(sentence, answers){
    let i = 0;
    return sentence.replace(/_+/g, () => answers[i++] ?? "___");
}

function reset(){
    setFibContent(null)
    setShowAnswers(false)
}

function FIB(){

    const {currentRound, cohortCharacters} = useAppContext()
    const [useCohort, setUseCohort] = useState(true)
    const [manualInput, setManualInput] = useState("")
    const [fibContent, setFibContent] = useState(null)
    const [showAnswers, setShowAnswers] = useState(false)

    function generate() {
        const url = useCohort
            ? `/generation/fib/${currentRound.id}`
            : `/generation/fib-custom`

        const options = useCohort
            ? { method: "POST" }
            : {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(Array.from(manualInput).filter((ch) => ch.trim() !== "")),
            }

        apiFetch(url, options)
        .then((res) => res.json())
        .then((data) => setFibContent(data))
    }

    return(
        <div>
            <h1>Fill in the blank</h1>
            <label>
                <input type="checkbox" checked={useCohort} onChange={(e) => setUseCohort(e.target.checked)} />
            </label>

            {!useCohort && (
                <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="not yet supported by the backend — display only"
                />
            )}

            <button onClick={generate}>Generate FIB</button>

            {fibContent && (
                <>
                    <p>
                        {showAnswers ? fillInBlanks(fibContent.sentence_with_blanks, fibContent.answers) : fibContent.sentence_with_blanks}
                    </p>
                    <button onClick={() => setShowAnswers(!showAnswers)}>
                        {showAnswers ? "Hide answers" : "Show answers"}
                    </button>
                </>
            )}

            <button onClick = {reset}>Reset</button>

        </div>
        
    )
}

export default FIB