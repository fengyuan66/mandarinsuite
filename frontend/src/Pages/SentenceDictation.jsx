import { useState, useEffect } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { apiFetch } from "../common/api.js";

import "../common/theme.css";
import "../css/SentenceDictation.css";
import PlayButton from "../assets/PlayButton.svg"

import DragonHead from "../assets/RedDragonHead.svg"
import DragonHeadSilent from "../assets/RedDragonHeadUnspeaking.svg"
function speak(text, rate = 1, onEnd = () => {}){
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = rate;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    window.speechSynthesis.speak(utterance);
}

function SentenceDictation(){
    const {currentRound, fetchActiveUnit} = useAppContext()
    const [useCohort, setUseCohort] = useState(true)
    const [manualInput, setManualInput] = useState("")
    const [content, setContent] = useState(null)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [showParagraph, setShowParagraph] = useState(false)

    const [skipped, setSkipped] = useState(false)

    function playAt(rate){
        setIsSpeaking(true);
        speak(content.paragraph, rate, () => setIsSpeaking(false));
    }

    useEffect(() => {
        fetchActiveUnit()
    }, [])

    function generate() {
        const url = useCohort
            ? `/generation/writing-dication/${currentRound.id}`
            : `/generation/writingdictation-custom`;

        const options = useCohort
            ? { method: "POST" }
            : {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Array.from(manualInput).filter((ch) => ch.trim() !== "")),
            };
        

        setIsGenerating(true)
        setShowParagraph(false)
        apiFetch(url, options)
        .then((res) => res.json())
        .then((data) => setContent(data))
        .finally(() => setIsGenerating(false))
    }

    function reset(){
        setContent(null)
        setShowParagraph(false)
    }

    return(
        <div>

            <div className="dragonhead">
                <img className="pet" src={DragonHead}></img>
            </div>

            <div className="drillpage-core">
                <h1 className="page-title">Sentence Dictation</h1>
                <p className="page-subtitle">Listen to the paragraph, then write down what you hear!</p>
            </div>
            
            <div className="controls-bar">
                <label className="toggle-label">
                    <input className="toggle" type="checkbox" checked={useCohort} onChange={(change) => setUseCohort(change.target.checked)} />
                    Use characters from current cohort
                </label>
            
            
                
                <div className="divider" />
            
                <button className="btn btn-primary" onClick={generate} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate paragraph"}
                </button>
                
                {content && !content.skipped && (
                    <button className="btn btn-primary" onClick={() => setShowParagraph(!showParagraph)}>
                    {showParagraph ? "Hide" : "Show"}
                    </button>
                )}

                <button className="link-quiet" onClick={reset}>Reset</button>
                <div className="divider" />
            
                
                {content && !content.skipped && (
                    <div className="speed-row">
                        <button className="play-btn" disabled={isSpeaking} onClick={() => playAt(0.2)}>
                            <img src={PlayButton} className="play-btn-img" />
                            Slow
                        </button>
                        <button className="play-btn" disabled={isSpeaking} onClick={() => playAt(0.5)}>
                            <img src={PlayButton} className="play-btn-img" />
                            Medium
                        </button>
                        <button className="play-btn" disabled={isSpeaking} onClick={() => playAt(0.7)}>
                            <img src={PlayButton} className="play-btn-img" />
                            Fast
                        </button>
                    </div>
                )}

                
            </div>

            {useCohort && content && content.skipped && (
                <p className="skipped-message">Skipped: {content.reason}</p>
            )}
            
            {!useCohort &&(
                    <input
                        type="text"
                        className="manual-input"
                        value={manualInput}
                        onChange={(change)=>setManualInput(change.target.value)}
                        placeholder="type characters to use (ex: 我爱汽车)"
                    
                    />
            )}
            
            {content && !content.skipped && showParagraph && (
                <div className="card passage-card">
                    <p className="passage-text">{content.paragraph}</p>
                </div>
            )}
            
            

            

        </div>
    )

}

export default SentenceDictation