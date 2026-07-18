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



function displayCohortChars(){
    {appcontext.cohortCharacters.map((character) => (

    <HanziDisplay key={character.id ?? character.hanzi} hanzi={character.hanzi} />

))}
}

function fillInBlanks(sentence, answers){
    let i = 0;
    return sentence.replace(/_+/g, () => answers[i++] ?? "___");
}




function Start(){
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
        createPracticeLogRaw
        
     } = useAppContext();

    const appcontext = useAppContext();
    
    //SHOW ANSWWER STATUSES

    const [showAnswers, setShowAnswers] = useState(false);
    const [showFibAnswers, setShowFibAnswers] = useState(false);
    const [showUnitFibAnswers, setShowUnitFibAnswers] = useState(false);
    
    //input handle

    const [timesWritten, setTimesWritten] = useState("");

    function createCohortPracticeLog() {
    const practiceEntries = appcontext.cohortCharacters.map((character) => ({
        character_id: character.id,
        times_written: Number(timesWritten)
    }));

        appcontext.createPracticeLog(practiceEntries);
    }

    
    
    useEffect(() => {
        fetchActiveUnit();
        appcontext.fetchCurrentCohort();

        setShowAnswers(false);
        setShowFibAnswers(false);
        setShowUnitFibAnswers(false);

    }, [currentRound && currentRound.status]);
    
    return(
        <>

        
        <pre style={{ background: "#eee", padding: "8px", fontSize: "12px" }}>
            {JSON.stringify({ currentRound, writingDictationContent, fibContent }, null, 2)}
        </pre>

        {!isGenerating && !activeUnit && currentRound && (
            <div className="empty-warning">
                <h1>No active unit found, but a round is found! Likely data glitch, please copy and wipe data</h1>
            </div>
        )}

        {!isGenerating && activeUnit && !currentRound && (
            <div className="empty-warning">
                <h1>Unit is found, but no active round found!</h1>
            </div>
        )}

        {!isGenerating && !activeUnit && !currentRound && (
            <div className="empty-warning">
                <h1>No active unit nor round found!</h1>
            </div>
        )}




        {currentRound && (

            <div className="round_wizard">

                {isGenerating && <p>LOADING...</p>}

                {currentRound.status === "cohort_ready" && (
                    <div>
                        <h1>COHORT ReaDY</h1>
                        <button onClick={advanceRound}>Start Practicing </button>
                    </div>
                )}

                {currentRound.status === "practicing" && (
                    <div>
                        <h1>Write each character 10-15 times and then a word with it</h1>
                        
                        {appcontext.cohortCharacters.map((character) => (

                            <HanziDisplay key={character.id ?? character.hanzi} hanzi={character.hanzi} />

                        ))}
                        <input type="number" value = {timesWritten} onChange = {(event) => setTimesWritten(event.target.value)} />
                        <button onClick={createCohortPracticeLog}>Save practice log</button>
                        <button onClick={advanceRound}>Move on to dictation</button>
                    </div>
                )}

                {currentRound.status === "dictation_offered" && (
                    <div>
                        <h1>Listen and write down each character / word</h1>
                        <button onClick={() => setShowAnswers(!showAnswers)}>show answers!</button>
                        
                        {showAnswers && appcontext.cohortCharacters.map((character) => (
                            <HanziDisplay key={character.id ?? character.hanzi} hanzi={character.hanzi} />
                        ))}
                        
                        <button onClick={advanceRound}>continue</button>
                    </div>
                )}

                {currentRound.status === "writing_dictation" && (
                    <div>
                        {writingDictationContent && writingDictationContent.skipped
                            ?<h1>Skipped! {writingDictationContent.reason}</h1>
                            :<h1>{writingDictationContent && writingDictationContent.paragraph}</h1>
                        }

                        <button onClick={advanceRound}>Continue to FIB</button>

                    </div>
                )}
            
                {currentRound.status === "fib" && (
                    <div>
                        <h1>FIB</h1>
                        
                        <p>
                            {showFibAnswers && fibContent
                                ? fillInBlanks(
                                    fibContent.sentence_with_blanks,
                                    fibContent.answers
                                )
                                : fibContent && fibContent.sentence_with_blanks
                            }
                        </p>
                        
                        <button onClick={() => setShowFibAnswers(!showFibAnswers)}>Toggle answers</button>

                        <button onClick={advanceRound}>Finish Round</button>
                    </div>
                )}

                {currentRound.status === "complete" && currentRound.progress < activeUnit.target_rounds &&(
                    <div>
                        <h1>Round complete!</h1>
                        <button onClick={createRound}>next round</button>
                    </div>
                )}

                {currentRound.status === "complete" && currentRound.progress >= activeUnit.target_rounds && (

                    <div>
                        {!unitReviewContent && <button onClick={finishUnit}>Review this unit</button>}
                        {unitReviewContent && (

                            <>
                                <h1>{unitReviewContent.paragraph}</h1>
                                <p>
                                    {showUnitFibAnswers
                                        ? fillInBlanks(unitReviewContent.fib.sentence_with_blanks, unitReviewContent.fib.answers)
                                        : unitReviewContent.fib.sentence_with_blanks}
                                </p>
                                <button onClick={() => setShowUnitFibAnswers(!showUnitFibAnswers)}>
                                    {showUnitFibAnswers ? "Hide answers" : "Show answers"}
                                </button>
                                <h1>{freeWriteContent && freeWriteContent.prompt}</h1>
                                <button onClick={startNextUnit}>Start next unit!</button>
                            </>

                        )}
                    
                    </div>

                )
                
                }

            </div>

        )}

        </>

    )
}

export default Start