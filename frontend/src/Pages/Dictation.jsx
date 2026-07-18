import { useEffect, useState, useRef } from "react";

import { useAppContext } from "../common/AppContext.jsx";


import { NEXT_STATUS } from "../common/constants.js";


import HanziWriter from "hanzi-writer";


const [showAnswers, setShowAnswers] = useState(false);
const [hanzi, setHanzi] = useState([""]);


useEffect(() => {
    

    setShowAnswers(false);
    setShowFibAnswers(false);
    setShowUnitFibAnswers(false);

}, []);


function Reset(){
    setShowAnswers(false);
    setHanzi([""]);
}

function Dictation(){

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
            <input
                type="text"
                value = {hanzi ?? ""}
                onChange = {(change) => setHanzi(change.target.value)}
            /> 

            <h1>Listen and write down each character / word</h1>
            <button onClick={() => setShowAnswers(!showAnswers)}>show answers!</button>
            
            {showAnswers && hanzi.map((character) => (
                <HanziDisplay key={character.id ?? character.hanzi} hanzi={character.hanzi} />
            ))}
            
            <button onClick={Reset}>Reset!</button>
        </div>
    )
}

export default Dictation