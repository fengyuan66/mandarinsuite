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

function Characterlist(){
    //display setup
    
    //characters is the data (FRONTEND-SIDE), setCharacters is the setter
    const [characters, setCharacters] = useState([]);

    const[currentCohort, setCurrentCohort] = useState(null);
    const [cohortCharacters, setCohortCharacters] = useState([]);
    const[latestRound, setLatestRound] = useState(null);
    const[activeUnit, setActiveUnit] = useState(null);

    //wizard (slideshow) setup

    const [writingDictationContent, setWritingDictationContent] = useState(null);
    const [fibContent, setFibContent] = useState(null);

    

    //input setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");

    useEffect(() => {
        fetchCurrentCohort();
        fetchActiveUnit();
        
    }, []);


    

    


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
