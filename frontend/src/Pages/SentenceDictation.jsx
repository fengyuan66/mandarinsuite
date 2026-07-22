import { useState, useEffect } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { apiFetch } from "../common/api.js";

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

        apiFetch(url, options)
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
                    : (
                        <>
                            <p>{content.paragraph}</p>
                            <button disabled={isSpeaking} onClick={() => playAt(0.2)}>Slow</button>
                            <button disabled={isSpeaking} onClick={() => playAt(0.5)}>Normal</button>
                            <button disabled={isSpeaking} onClick={() => playAt(0.7)}>Fast</button>
                        </>
                    )
            )}

            <button onClick={reset}>Reset</button>

        </div>
    )

}

export default SentenceDictation