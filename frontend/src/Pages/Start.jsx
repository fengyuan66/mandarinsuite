import { useEffect, useState } from "react";



import {
advanceRound,
fetchCharacters,
postCharacters,
postCharactersAI,
fetchCurrentCohort,
fetchActiveUnit,
fetchCurrentRound,
createUnit,
} from "../common/functions.js";

import { NEXT_STATUS } from "../common/constants.js";

function Start(){



    const [characters, setCharacters] = useState([]);

    const[currentCohort, setCurrentCohort] = useState(null);
    const [cohortCharacters, setCohortCharacters] = useState([]);
    const[currentRound, setCurrentRound] = useState(null);
    const[activeUnit, setActiveUnit] = useState(null);

    //wizard (slideshow) setup

    const [writingDictationContent, setWritingDictationContent] = useState(null);
    const [fibContent, setFibContent] = useState(null);

    

    //input setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");

    return(
        <>
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

                {currentRound.status === "complete" && (
                    <div>
                        <p>Round complete!</p>
                        <button onClick={advanceRound}>next round</button>
                    </div>
                )}

            </div>

        )}

        </>

    )
}

export default Start