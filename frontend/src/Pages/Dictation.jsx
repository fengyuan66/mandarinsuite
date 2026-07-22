import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import { NEXT_STATUS } from "../common/constants.js";
import HanziWriter from "hanzi-writer";

import PlayButton from "../assets/PlayButton.svg"


import "../css/Dictation.css";
import "../common/theme.css";

import DragonHead from "../assets/RedDragonHead.svg"
import DragonHeadSilent from "../assets/RedDragonHeadUnspeaking.svg"
import PetButton from "../assets/Glasses.png"

import "../css/DragonPet.css"

function speak(text, onEnd = () => {}){
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.lang = "zh-CN";
    utterance.rate = 0.75;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
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



function Dictation(){
    
    
    const [showAnswers, setShowAnswers] = useState(false);
    const [hanzi, setHanzi] = useState("");
    const [useCohort, setUseCohort] = useState(true);

    //PET STATES:

    const [pet, setPet] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

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
        
        
     } = useAppContext();

    const appcontext = useAppContext();


    function Reset(){
        setShowAnswers(false);
        setHanzi("");
    }


    function closePet(){
    setLeaving(true)
    setTimeout(() => {
        setPet(false)
        setLeaving(false)
    }, 400)
}


    return(
        <div>

            <div className="dragonhead">
                {pet || leaving
                ?
                    isSpeaking
                    ?<img className={`pet${leaving ? " pet-exit" : ""}`} src={DragonHead} onClick={closePet}></img>
                    :<img className={`pet${leaving ? " pet-exit" : ""}`} src={DragonHeadSilent} onClick={closePet}></img>
                    
                :
                    <img className="petbutton" src={PetButton} onClick={() => setPet(true)} />   
                }
            </div>

            <div className="drillpage-core">
                <h1 className="page-title">Dictation</h1>
                <p className="page-subtitle">Listen to each character or word, then write it down.</p>
            </div>

            <div className="controls-bar">
                <label className="toggle-label">
                    <input
                        type="checkbox"
                        className="toggle"
                        checked={useCohort}
                        onChange={(state) => setUseCohort(state.target.checked)}
                    />
                    Use current cohort's characters
                </label>

                <button className="btn btn-primary" onClick={() => setShowAnswers(!showAnswers)}>
                    {showAnswers ? "hided answers" : "show answers"}
                </button>
                <button className="link-quiet" onClick={Reset}>Reset!</button>
            </div>



            {!useCohort && (

                <input
                type="text"
                className="manual-input"
                value={hanzi}

                onChange={(change) => setHanzi(change.target.value)}
                placeholder="type characters to practice, e.g: 我爱你"
                />
            
            )}
            {useCohort && (
                <div className="play-row">
                    {cohortCharacters.map((character, i) => (
                        <button key={character.id ?? i} className="play-btn" onClick={() => { setIsSpeaking(true); speak(character.hanzi, () => setIsSpeaking(false)); }}>
                            <img src={PlayButton} className="play-btn-img" />
                            Play #{i + 1}
                        </button>
                    ))}
                </div>
            )}
            {!useCohort && (
                <div className="play-row">
                    {Array.from(hanzi).map((character, i) => (
                        <button key={character.id ?? i} className="play-btn" onClick={() => { setIsSpeaking(true); speak(character, () => setIsSpeaking(false)); }}>
                            <img src={PlayButton} className="play-btn-img" />
                            Play #{i + 1}
                        </button>
                    ))}
                </div>
            )}


            <div className="actions-row">
                
            </div>

            {showAnswers && (
                <div className="character-grid">
                    {(useCohort

                        ? cohortCharacters.map((character) => (
                            <div className="character-card" key={character.id ?? character.hanzi}>
                                <HanziDisplay hanzi={character.hanzi} />
                            </div>
                        ))
                        : Array.from(hanzi).map((character, i) => (
                            <div className="character-card" key={i}>
                                <HanziDisplay hanzi={character} />
                            </div>
                        ))

                    )}
                </div>
            )}
        </div>
    )
}

export default Dictation