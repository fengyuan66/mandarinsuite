import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { NEXT_STATUS } from "../common/constants.js";
import HanziWriter from "hanzi-writer";




//HANZIWRITER SETUP
function HanziDisplay({ hanzi }) {
    const targetRef = useRef(null);

    useEffect(() => {
        targetRef.current.innerHTML = "";
        HanziWriter.create(targetRef.current, hanzi, {
            width: 150,
            height: 150,
            showOutline: true,
        });
    }, [hanzi]);

    return <div ref={targetRef}></div>;
}



function Dictation(){
    
    
    const [showAnswers, setShowAnswers] = useState(false);
    const [hanzi, setHanzi] = useState("");
    const [useCohort, setUseCohort] = useState(true);

    useEffect(() => {
        
        fetchCurrentCohort();
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
        cohortCharacters,
        HanziDisplay
        
     } = useAppContext();

    const appcontext = useAppContext();


    function Reset(){
        setShowAnswers(false);
        setHanzi([""]);
    }


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
            
            {showAnswers && (useCohort
                ? cohortCharacters.map((character) => (
                    <HanziDisplay key={character.id ?? character.hanzi} hanzi={character.hanzi} />
                ))
                : Array.from(hanzi).map((character, i) => (
                    <HanziDisplay key={i} hanzi={character} />
                ))
            )}
            
            <button onClick={Reset}>Reset!</button>
        </div>
    )
}

export default Dictation