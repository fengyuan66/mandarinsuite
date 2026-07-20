import {useState, useEffect} from "react";
import {useAppContext} from "../common/AppContext.jsx";
import {apiFetch} from "../common/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../common/AuthContext.jsx";


function Stats(){


    const { characters, currentCohort, cohortCharacters, activeUnit, currentRound,
        fetchActiveUnit, fetchCurrentRound, fetchCurrentCohort, fetchCharacters,
        postCharacters, postCharactersAI, createUnit, createRound, wipeAllData, fetchAllUnits, loadUnit, isGenerating} = useAppContext();
    const {logout} = useAuth()
    const navigate = useNavigate()

    const [units, setUnits] = useState([])
    const [cohorts, setCohorts] = useState([])
    const [viewedCohort, setViewedCohort] = useState(null)
    
    const [username, setUsername] = useState("");
    
    // Archived: manual add-character form state. The form below (postCharacters)
    // creates raw Character rows with no cohort/user linkage, so it doesn't show up
    // in the user's characterbank. Disabled until that's reworked.
    // const [storedhanzi, setstoredhanzi] = useState("");
    // const [storedpinyin, setstoredpinyin] = useState("");
    // const [storedmeaning, setstoredmeaning] = useState("");
    // const [storedstrokec, setstoredstrokec] = useState("");


    useEffect(() => {
        fetchAllUnits().then(setUnits);
        refreshCohorts()
    }, [activeUnit])

    useEffect(() => {
        viewUser();
        apiFetch("/cohort/all").then((res) => res.json()).then(setCohorts);
    }, [])

    function handleLogout(){
        logout().then(() => navigate("/login")) 
    }

    function viewCohort(cohortID){
        apiFetch(`/cohort/${cohortID}`)
        .then((res) => res.json())
        .then(setViewedCohort)
    }

    function refreshCohorts(){
        apiFetch("/cohort/all").then((res) => res.json()).then(setCohorts);
    }

    useEffect(() => {
        viewUser();
        refreshCohorts();
        refreshUnits();
        refreshPracticeLogs();
    }, [])

    function refreshUnits(){
        apiFetch("/unit/all").then((res) => res.json()).then(setUnits);
    }


    function viewUser(){
        apiFetch("/generation/getuser")
        .then((res)=>res.json())
        .then((username) => {setUsername(username)})
    }


    const [practiceLogs, setPracticeLogs] = useState([]);
    const [viewedLog, setViewedLog] = useState(null);

    function refreshPracticeLogs(){
        apiFetch("/practicelog/all").then((res) => res.json()).then(setPracticeLogs);
    }

    function viewPracticeLog(logId){
        apiFetch(`/practicelog/archived?id=${logId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then(setViewedLog);
    }

    return (
        <div>

            <div>
                <p>Currently logged in as: {username}</p>
                <button onClick = {handleLogout}>Log out</button>
            </div>

            <div>
                <h1>Units</h1>
                <button onClick={createUnit} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Create a new unit!"}
                </button>
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
                    {cohorts.map((cohort, index) => (
                        <li key={cohort.id}>
                            Cohort {index + 1}
                            <button onClick={() => viewCohort(cohort.id)}>View cohort</button>
                        </li>
                    ))}
                </ul>
                
                {viewedCohort && (
                    <div>
                        <h2>Cohort {cohorts.findIndex(cohort => cohort.id === viewedCohort.cohort.id) + 1}</h2>
                        <ul>
                            {viewedCohort.characters.map((character) => (
                                <li key={character.id}>{character.hanzi} | {character.pinyin} | {character.meaning}</li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>

            <div>
                <h1>Your practice logs</h1>
                    <ul>
                        {practiceLogs.map((log) => (
                            <li key={log.id}>
                                {log.session_time.split("T")[0]}
                                <button onClick={() => viewPracticeLog(log.id)}>View</button>
                            </li>
                        ))}
                    </ul>

                    {viewedLog && (
                        <div>
                            <h2>Log {viewedLog.id} — {viewedLog.session_time.split("T")[0]}</h2>
                            <ul>
                                {viewedLog.entries.map((entry) => (
                                    <li key={entry.id}>{entry.hanzi} — written {entry.times_written} times</li>
                                ))}
                            </ul>
                        </div>
                    )}
            </div>




            



            <div className="characterbankPage">
            <div className="getcharacters">
            <button onClick={fetchCharacters}>Click to fetch Mandarin characterbank</button>
            <button onClick={() => { setViewedLog(null); setViewedCohort(null); wipeAllData().then(refreshCohorts).then(refreshUnits).then(refreshPracticeLogs); }}>
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
            {/* Archived: manual add character form
                Disabled until that's reworked...
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
            */}
            <div className="aiexplorecharacters">
                <button onClick={() => postCharactersAI().then(refreshCohorts)}>Click to discover new characters using AI</button>
            </div>
            
        </div>
        </div>
    )

}


export default Stats