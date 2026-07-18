import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { NEXT_STATUS } from "../common/constants.js";
import HanziWriter from "hanzi-writer";
import HanziDisplay from "../Components/HanziDisplay.jsx"

function Reset(){
    setShowAnswers(false);
    setHanzi([""]);
}

function Dictation(){
    const {cohortCharacters} = useAppContext();
    const [showAnswers, setShowAnswers] = useState(false);
    const [hanzi, setHanzi] = useState("");
    const [useCohort, setUseCohort] = useState(true);

    useEffect(() => {
        

        setShowAnswers(false);
        

    }, []);

    const { createRound, 
        startNextUnit, 
        finishUnit, 
        unitReviewContent, 
        freeWriteContent, 
        currentRound, 
        writingDictationContent, 
        fibContent, 
        advanceRound, 
        fetchActiveUnit, 
        fetchCurrentCohort,
        activeUnit,
        isGenerating,
        createPracticeLog,
        addPracticeEntry,
        createPracticeLogRaw,
        cohortCharacters
        
     } = useAppContext();

    const appcontext = useAppContext();
    return(
        <div>
            <h1>Listen and write down each character / word</h1>
            {!useCohort && (
                <input
                type="text"
                value = {hanzi}
                onChange = {(change) => setHanzi(change.target.value)}
                /> 
            )}
            <button onClick={() => setShowAnswers(!showAnswers)}>{showAnswers ? "hided answers" : "show answers"}</button>
            
            {showAnswers && hanzi.map((character, i) => (
                <HanziDisplay key={i} hanzi={character} />
            ))}
            
            <button onClick={Reset}>Reset!</button>
        </div>
    )
}

export default Dictation