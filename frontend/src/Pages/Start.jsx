import { useEffect, useState, useRef } from "react";

import { useAppContext } from "../common/AppContext.jsx";


import { NEXT_STATUS } from "../common/constants.js";


import HanziWriter from "hanzi-writer";

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
        activeUnit
     } = useAppContext();

    const appcontext = useAppContext();


    useEffect(() => {
        fetchActiveUnit();
        appcontext.fetchCurrentCohort();
    }, []);
    
    return(
        <>

        
        <pre style={{ background: "#eee", padding: "8px", fontSize: "12px" }}>
            {JSON.stringify({ currentRound, writingDictationContent, fibContent }, null, 2)}
        </pre>



        {currentRound && (

            <div className="round_wizard">

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
                        <button onClick={advanceRound}>Move on to dictation</button>
                    </div>
                )}

                {currentRound.status === "dictation_offered" && (
                    <div>
                        <h1>Listen and write down each character / word</h1>
                        <button onClick={advanceRound}>Reveal answers and continue</button>
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
                                <h1>{unitReviewContent.fib.sentence_with_blanks}</h1>
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