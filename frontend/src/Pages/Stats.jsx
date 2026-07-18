import {useState, useEffect} from "react";
import {useAppContext} from "../common/AppContext.jsx";
import {apiFetch} from "../common/api.js";

function Stats(){
    const { characters, currentCohort, cohortCharacters, activeUnit, currentRound,
        fetchActiveUnit, fetchCurrentRound, fetchCurrentCohort, fetchCharacters,
        postCharacters, postCharactersAI, createUnit, createRound, wipeAllData, fetchAllUnits, loadUnit} = useAppContext();
    const [units, setUnits] = useState([])
    const [cohorts, setCohorts] = useState([])
    const [viewedCohort, setViewedCohort] = useState(null)
    
    //Hanzi section setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");
   

    useEffect(() => {
        fetchAllUnits().then(setUnits);
        
    }, [activeUnit])

    useEffect(() => {
        
        apiFetch("/cohort/all").then((res) => res.json()).then(setCohorts);
    }, [])

    function viewCohort(cohortID){
        apiFetch(`/cohort/${cohortID}`)
        .then((res) => res.json())
        .then(setViewedCohort)
    }

    return (
        <div>
            <div>
                <h1>Units</h1>
                <button onClick={createUnit}>Create a new unit!</button>
                <ul>
                    {units.map((unit => (
                        <li key={unit.id}>
                            {unit.theme} {unit.is_active && "(active)"}
                            <button onClick={() => loadUnit(unit.id)}>Load</button>
                        </li>
                    )))}
                </ul>
                <h1>View your past cohorts</h1>
                
                
                
                <ul>
                    {cohorts.map((cohort) => (
                        <li key={cohort.id}>
                            Cohort {cohort.id}
                            <button onClick={() => viewCohort(cohort.id)}>View cohort</button>
                        </li>
                    ))}
                </ul>
                
                {viewedCohort && (
                    <div>
                        <h2>Cohort {viewedCohort.cohort.id}</h2>
                        <ul>
                            {viewedCohort.characters.map((character) => (
                                <li key={character.id}>{character.hanzi} | {character.pinyin} | {character.meaning}</li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>




            



            <div className="characterbankPage">
            <div className="getcharacters">
            <button onClick={fetchCharacters}>Click to fetch Mandarin characterbank</button>
            <button onClick={wipeAllData}>
                Wipe all data
            </button>
            
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
            
        </div>
        </div>
    )

}


export default Stats