import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { NEXT_STATUS } from "../common/constants.js";
import { apiFetch } from "../common/api.js";
import HanziWriter from "hanzi-writer";

import "../common/theme.css";
import "../css/FIB.css";


function fillInBlanks(sentence, answers){
    let i = 0;
    return sentence.replace(/_{3}/g, () => answers[i++] ?? "___");
}

function renderSentence(content, showAnswers){
    if(!content) return null;

    const collapsed = content.sentence_with_blanks.replace(/(_{3})( )(?=_{3})/g, "$1");
    const parts = collapsed.split(/(_{3})/g);
    let answerIndex = 0;

    return parts.map((part, i) => {
        if (part === "___"){
            const answer = content.answers[answerIndex ++];
            return (
                <span className="fib-blank" key = {i}>
                    {showAnswers ? answer: ""}
                </span>
            )
        }
        return <span key={i}>{part}</span>
    })
}



function FIB(){

    const {currentRound, cohortCharacters, fetchActiveUnit} = useAppContext()
    
    const [isGenerating, setIsGenerating] = useState(false)
    const [useCohort, setUseCohort] = useState(true)
    const [manualInput, setManualInput] = useState("")
    const [fibContent, setFibContent] = useState(null)
    const [showAnswers, setShowAnswers] = useState(false)

    useEffect(() => {
        fetchActiveUnit()
    }, [])

    function reset(){
        setFibContent(null)
        setShowAnswers(false)
    }

    function generate() {

        if (useCohort && !currentRound) return

        const url = useCohort
            ? `/generation/fib/${currentRound.id}`
            : `/generation/fib-custom`

        const options = useCohort
        ? { method: "POST" }
        : {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(Array.from(manualInput).filter((ch) => /[\u4e00-\u9fff]/.test(ch))),
        }

        setIsGenerating(true)
        apiFetch(url, options)
        .then((res) => res.json())
        .then((data) => setFibContent(data))
        .then((data) => { console.log(data); setFibContent(data); })
        .finally(() => setIsGenerating(false))
    }

    return(
        <div>
            <div className="drillpage-core">
                <h1 className= "page-title">Fill in the blank</h1>
                <p className = "page-subtitle">Write down the sentence on paper, filling in the missing parts!</p>
            </div>

            <div className="controls-bar">
                <label className = "toggle-label">
                    <input className="toggle" type="checkbox" checked={useCohort} onChange={(e) => setUseCohort(e.target.checked)} />
                    Use current cohort's characters
                </label>
            </div>
            
            

            {!useCohort && (
                <input
                    type="text"
                    className="manual-input"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="type characters to use (ex: 我爱你)"
                />
            )}

            <div className="actions-row">
                <button 
                    className="btn btn-primary" 
                    onClick={generate}
                    disabled={isGenerating}
                >
                {isGenerating ? "Generating..." : "Generate FIB"}
                </button>
                
                <button className="link-quiet" onClick = {reset}>Reset</button>

            </div>

            

            {fibContent && (
                <>

                    <div className="card passage-card">
                        <p className="passage-text">
                            {showAnswers ? fillInBlanks(fibContent.sentence_with_blanks, fibContent.answers) : fibContent.sentence_with_blanks}
                        </p>
                    </div>
                    <div className="actions-row">
                        <button className="btn btn-primary" onClick={() => setShowAnswers(!showAnswers)}>
                            {showAnswers ? "Hide answers" : "Show answers"}
                        </button>
                    </div>
                    
                </>
            )}

            

        </div>
        
    )
}

export default FIB