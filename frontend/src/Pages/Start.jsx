import { useEffect, useState } from "react";

import { useAppContext } from "../common/AppContext.jsx";


import { NEXT_STATUS } from "../common/constants.js";

function Start(){
   const { createRound, startNextUnit, finishUnit, unitReviewContent, freeWriteContent, currentRound, writingDictationContent, fibContent, advanceRound, fetchActiveUnit } = useAppContext();

    useEffect(() => {
        fetchActiveUnit();
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
                        <p>COHORT ReaDY</p>
                        <button onClick={advanceRound}>Start Practicing </button>
                    </div>
                )}

                {currentRound.status === "practicing" && (
                    <div>
                        <p>Write each character 10-15 times and then a word with it</p>
                        <button onClick={advanceRound}>Move on to dictation</button>
                    </div>
                )}

                {currentRound.status === "dictation_offered" && (
                    <div>
                        <p>Listen and write down each character / word</p>
                        <button onClick={advanceRound}>Reveal answers and continue</button>
                    </div>
                )}

                {currentRound.status === "writing_dictation" && (
                    <div>
                        {writingDictationContent && writingDictationContent.skipped
                            ?<p>Skipped! {writingDictationContent.reason}</p>
                            :<p>{writingDictationContent && writingDictationContent.paragraph}</p>
                        }

                        <button onClick={advanceRound}>Continue to FIB</button>

                    </div>
                )}
            
                {currentRound.status === "fib" && (
                    <div>
                        <p>FIB</p>
                        <button onClick={advanceRound}>Finish Round</button>
                    </div>
                )}

                {currentRound.status === "complete" && currentRound.progress < fetchActiveUnit.target_rounds &&(
                    <div>
                        <p>Round complete!</p>
                        <button onClick={createRound}>next round</button>
                    </div>
                )}

                {currentRound.status === "complete" && currentRound.progress >= fetchActiveUnit.target_rounds (

                    <div>
                        {!unitReviewContent && <button onClick={finishUnit}>Review this unit</button>}
                        {unitReviewContent && (

                            <>
                                <p>{unitReviewContent.paragraph}</p>
                                <p>{unitReviewContent.fib.sentence_with_blanks}</p>
                                <p>{freeWriteContent && freeWriteContent.prompt}</p>
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