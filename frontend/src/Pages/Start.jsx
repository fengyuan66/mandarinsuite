import { useEffect, useState, useRef } from "react";

import { useAppContext } from "../common/AppContext.jsx";


import { NEXT_STATUS } from "../common/constants.js";


import HanziWriter from "hanzi-writer";

import "../common/theme.css";
import "../css/Start.css";

import PlayButton from "../assets/PlayButton.svg";
import IconReady from "../assets/Start_Ready.svg";
import IconPractice from "../assets/Start_Practice.svg";
import IconDictation from "../assets/Start_Dictation.svg";
import IconFIB from "../assets/Start_FIB.svg";
import IconAdvance from "../assets/Start_Advance.svg";
import Warning from "../assets/ExclamationMark.svg"



function speak(text){
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.75;
    window.speechSynthesis.speak(utterance);
}

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
    return sentence.replace(/_{3}/g, () => answers[i++] ?? "___");
}




function Start(){
    const { createRound, 
        createUnit,
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
    const [practiceLogged, setPracticeLogged] = useState(false);
    
    //input handle

    const [timesWritten, setTimesWritten] = useState("");

    // input handle for individual # practiced boxes
    const [counts, setCounts] = useState({}); 



    const[initialCheckDone, setInitialCheckDone] = useState(false)



    function updateCount(characterId, value) {
        setCounts((prev) => ({ ...prev, [characterId]: value }));
    }

    function applyMasterCount() {
        const value = Number(timesWritten) || 0;
        setCounts((prev) => {
            const updated = { ...prev };
            appcontext.cohortCharacters.forEach((character) => {
                updated[character.id] = value;
            });
            return updated;
        });
    }

    function createCohortPracticeLog() {
        const practiceEntries = appcontext.cohortCharacters
            .map((character) => ({
                character_id: character.id,
                times_written: Number(counts[character.id]) || 0
            }))
            .filter((e) => e.times_written > 0);

        appcontext.createPracticeLog(practiceEntries).then(() => setPracticeLogged(true));
    }



    
    
    useEffect(() => {
        setInitialCheckDone(false)
        fetchActiveUnit().finally(() => setInitialCheckDone(true))
    }, []);

    useEffect(() => {
        appcontext.fetchCurrentCohort();

        setShowAnswers(false);
        setShowFibAnswers(false);
        setShowUnitFibAnswers(false);
        setPracticeLogged(false);

        setCounts({})
        setTimesWritten("")


    }, [currentRound && currentRound.status]);
    
    return(
        <>

        
        {/*<pre style={{ background: "#eee", padding: "8px", fontSize: "12px" }}>
            {JSON.stringify({ currentRound, writingDictationContent, fibContent }, null, 2)}
        </pre>*/}

        {!isGenerating && !activeUnit && currentRound && (
            <div className="empty-warning intermission">
                <h1 className="page-title">No active unit found, but a round is found! Likely data glitch, please copy and wipe data</h1>
                
            </div>
        )}

        {(isGenerating || !initialCheckDone) && !currentRound && (
            <p className="page-subtitle intermission">Loading...</p>
        )}

        {!isGenerating && initialCheckDone && activeUnit && !currentRound && (
            <div className="empty-warning intermission">
                <img className="warningicon" src={Warning}></img>
                <h1 className="page-title">Unit is found, but no active round found!</h1>
                <button className="btn-primary" onClick={createRound}>Quickfix -- Create a new round for this unit</button>
            </div>
        )}

        {!isGenerating && initialCheckDone && !activeUnit && !currentRound && (
            <div className="empty-warning intermission">
                <img className="warningicon" src={Warning}></img>
                <h1 className="page-title">No active unit nor round found!</h1>
                <button className="btn-primary" onClick={createUnit}>Quickstart -- create a new unit!</button>
            </div>
        )}


        
        {currentRound && (

            <div className="round_wizard">

                {isGenerating && <p className="page-subtitle page-loading">LOADING...</p>}

                {currentRound.status === "cohort_ready" && (
                    <div className="intermission">
                        <img className="intermission-icon" src={IconReady} />
                        <h1 className="page-title">Round Ready!</h1>
                        <button className="btn-primary intermission-button" onClick={advanceRound}>Start Practicing </button>
                    </div>
                )}

                {currentRound.status === "practicing" && (
                    <div>

                        <div className="drillpage-core">
                            <div className="round-status-header">
                                
                                <img className="round-status-icon" src={IconPractice} />

                                    <div className="start-round-status-core">
                                        <h1 className="page-title">Practice</h1>
                                        <p>Write each character 10-15 times and then a word with it</p>
                                    </div>
                                

                            </div>
                        </div>
                        
                        <div className="controls-bar">
                            <div className="bulk-apply">
                                
                                <input
                                    type="number"
                                    className="bulk-input"
                                    value={timesWritten}
                                    onChange={(event) => setTimesWritten(event.target.value)}
                                    placeholder="times written (all characters)"
                                />
                                <button className="btn btn-secondary apply-btn" onClick={applyMasterCount}>Apply to all</button>




                            </div>
                        </div>

                        <div className="character-grid">

                            {appcontext.cohortCharacters.map((character) => (
                                <div className="character-card" key={character.id ?? character.hanzi}>
                                    <HanziDisplay hanzi={character.hanzi} />
                                    <input
                                        type="number"
                                        min="0"
                                        value={counts[character.id] ?? ""}
                                        onChange={(e) => updateCount(character.id, e.target.value)}
                                        placeholder="times written"
                                    />
                                </div>
                            ))}

                        </div>

                        <div className="actions-row">
                            
                            <button className="btn btn-primary submit-btn" onClick={createCohortPracticeLog}>Save practice log</button>
                            <button className="btn btn-primary" onClick={advanceRound}>Move on to dictation</button>
                            {practiceLogged && <p className="success-popup">Logged!</p>}

                        </div>

                        
                    </div>
                )}


                {currentRound.status === "dictation_offered" && (
                    <div>
                        <div className="drillpage-core">
                            <div className="round-status-header">
                                <img className="round-status-icon" src={IconDictation} alt="" />
                                <h1 className="page-title">Listen and write down each character / word</h1>
                            </div>
                        </div>

                        <div className="play-row">
                            {appcontext.cohortCharacters.map((character, i) => (
                                <button key={character.id ?? i} className="play-btn" onClick={() => speak(character.hanzi)}>
                                    <img src={PlayButton} className="play-btn-img" />
                                    Play #{i + 1}
                                </button>
                            ))}
                        </div>
                        <div className="controls-bar">
                            <button className="btn btn-primary" onClick={() => setShowAnswers(!showAnswers)}>show answers!</button>
                            <button className="link-quiet" onClick={advanceRound}>continue</button>
                        </div>

                        {showAnswers && (
                            <div className="character-grid">
                                {appcontext.cohortCharacters.map((character) => (
                                    <div className="character-card" key={character.id ?? character.hanzi}>
                                        <HanziDisplay hanzi={character.hanzi} />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}

                {currentRound.status === "writing_dictation" && (
                    <div>

                        <div className="drillpage-core">
                            <div className="round-status-header">
                                <img className="round-status-icon" src={IconDictation} alt="" />
                                <h1 className="page-title">Sentence Dictation</h1>
                            </div>
                            <p className="page-subtitle">Listen to the paragraph, then write down what you hear!</p>
                        </div>

                        <div className="controls-bar">
                            {writingDictationContent && !writingDictationContent.skipped && (
                                <button className="play-btn" onClick={() => speak(writingDictationContent.paragraph)}>
                                    <img src={PlayButton} className="play-btn-img" />
                                    Play
                                </button>

                            )}
                            <button className="btn btn-primary" onClick={advanceRound}>Continue to FIB</button>
                        </div>

                        {writingDictationContent && writingDictationContent.skipped && (
                            <p className="skipped-message">Skipped! {writingDictationContent.reason}</p>
                        )}

                        {writingDictationContent && !writingDictationContent.skipped && (
                            <div className="card passage-card">
                                <p className="passage-text">{writingDictationContent.paragraph}</p>
                            </div>
                        )}

                    </div>
                )}
            
                {currentRound.status === "fib" && (
                    <div>
                        <div className="drillpage-core">
                            <div className="round-status-header">
                                <img className="round-status-icon" src={IconFIB} alt="" />
                                <h1 className="page-title">FIB</h1>
                            </div>
                        </div>

                        <div className="controls-bar">
                            <button className="btn btn-primary" onClick={() => setShowFibAnswers(!showFibAnswers)}>Toggle answers</button>
                            <button className="link-quiet" onClick={advanceRound}>Finish Round</button>
                        </div>

                        <div className="card passage-card">
                            <p className="passage-text">
                                {showFibAnswers && fibContent
                                    ? fillInBlanks(fibContent.sentence_with_blanks, fibContent.answers)
                                    : fibContent && fibContent.sentence_with_blanks
                                }
                            </p>
                        </div>
                    </div>
                )}

                {currentRound.status === "complete" && currentRound.progress < activeUnit.target_rounds &&(
                    <div className="intermission">
                        <img className="intermission-icon" src={IconAdvance} alt="" />
                        <h1 className="page-title">Round complete!</h1>
                        <button className="btn-primary intermission-button" onClick={createRound}>next round</button>
                    </div>
                )}

                {currentRound.status === "complete" && currentRound.progress >= activeUnit.target_rounds && (

                    <div>
                        {!unitReviewContent && (
                            
                            <div className="intermission">
                                <img className="intermission-icon" src={IconAdvance} alt="" />
                                <h1 className="page-title">Unit complete!</h1>
                                <button className="btn-primary intermission-button" onClick={finishUnit}>Review this unit</button>
                            </div>
                        
                        )}
                        {unitReviewContent && (

                            <>
                                <div className="drillpage-core">
                                    <div className="round-status-header">
                                        <img className="round-status-icon" src={IconAdvance} alt="" />
                                        <h1 className="page-title">Unit complete!</h1>
                                    </div>
                                </div>


                                <div className="card passage-card">
                                    <p className="passage-text">{unitReviewContent.paragraph}</p>
                                </div>

                                <div className="controls-bar">
                                    <button className="btn btn-primary" onClick={() => setShowUnitFibAnswers(!showUnitFibAnswers)}>
                                        {showUnitFibAnswers ? "Hide answers" : "Show answers"}
                                    </button>
                                </div>

                                <div className="card passage-card">
                                    <p className="passage-text">
                                        {showUnitFibAnswers
                                            ? fillInBlanks(unitReviewContent.fib.sentence_with_blanks, unitReviewContent.fib.answers)
                                            : unitReviewContent.fib.sentence_with_blanks}
                                    </p>
                                </div>

                                <div className="drillpage-core">
                                    <h1 className="page-title">{freeWriteContent && freeWriteContent.prompt}</h1>
                                </div>

                                <div className="controls-bar">
                                    <button className="btn btn-primary" onClick={startNextUnit}>Start next unit!</button>
                                </div>
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