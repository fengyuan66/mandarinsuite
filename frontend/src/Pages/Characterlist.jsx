import { useEffect, useState } from "react";

import { useAppContext } from "../common/AppContext.jsx";

import { NEXT_STATUS } from "../common/constants.js";

function Characterlist(){

    //display setup
    
    //characters is the data (FRONTEND-SIDE), setCharacters is the setter
    
    useEffect(() => {
        fetchCurrentCohort();
        fetchActiveUnit();
        
    }, []);


    const { characters, currentCohort, cohortCharacters, activeUnit, currentRound,
        fetchActiveUnit, fetchCurrentRound, fetchCurrentCohort, fetchCharacters,
        postCharacters, postCharactersAI, createUnit, createRound } = useAppContext();

    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");

    


    return(
        <div className="characterbankPage">
            <div className="getcharacters">
            <button onClick={fetchCharacters}>Click to fetch Mandarin characterbank</button>
            <ul>
                {
                    characters.map((character) => (
                        <li key={character.id}>
                            {character.hanzi} | {character.pinyin} | {character.meaning} | {character.strokec}
                        </li>
                    ))
                }
            </ul>
            </div>
            <div className="addcharacters">
                <input
                    type="text"
                    value={storedhanzi}
                    onChange={(event) => setstoredhanzi(event.target.value)}
                />

                <input
                    type="text"
                    value={storedpinyin}
                    onChange={(event) => setstoredpinyin(event.target.value)}
                />
                <input
                    type="text"
                    value={storedmeaning}
                    onChange={(event) => setstoredmeaning(event.target.value)}
                />
                <input
                    type="number"
                    value={storedstrokec}
                    onChange={(event) => setstoredstrokec(event.target.value)}
                />

                <button onClick={() => postCharacters(storedhanzi,storedpinyin,storedmeaning,storedstrokec)}>
                    Submit
                </button>
            </div>
            <div className="aiexplorecharacters">
                <button onClick={postCharactersAI}>Click to discover new characters using AI</button>
            </div>
            <div className = "unit display">
                <button onClick={createUnit}>Click to start a new unit!</button>
                <button onClick={createRound} disabled={activeUnit == null}>Start new round</button>
                {
                    activeUnit == null? (
                        <p>No active unit!</p>
                    ) : (
                        <>
                            <p>Unit ID: {activeUnit.id}</p>
                            <p>Unit theme: {activeUnit.theme}</p>
                            <p>Unit target rounds: {activeUnit.target_rounds}</p>
                            <p>Unit created at: {activeUnit.created_at}</p>
                            <p>Unit is active? {activeUnit.is_active}</p>
                        </>
                    )
                }
                
            </div>
            <div className="cohort display">
                {
                
                    currentCohort == null ? (
                        <p>No active cohort!</p>
                    ) : (
                        <>
                            <p>Cohort ID: {currentCohort.id}</p>
                            <ul>
                                {cohortCharacters.map(character => {
                                    return (
                                        <li key={character.id}>
                                            {character. hanzi}
                                            {" | "}
                                            {character.pinyin}
                                            {" | "}
                                            {character.meaning}
                                            {" | "}
                                            {character.strokec}
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )
                    

                
                }
            </div>
        </div>

    )
}

export default Characterlist
