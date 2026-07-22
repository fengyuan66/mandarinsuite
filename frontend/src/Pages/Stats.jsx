import {useState, useEffect} from "react";
import {useAppContext} from "../common/AppContext.jsx";
import {apiFetch} from "../common/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../common/AuthContext.jsx";

import "../common/theme.css";
import "../css/Stats.css"

import UseButton from "../assets/Use.svg"
import EyesButton from "../assets/Eyes.svg"

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
        <div className="stat-contents">

            <div className="top-row">
                <h1 className="page-title">Stats</h1>
                <div className="account-bar">
                    <span className="account-email">Logged in as {username}</span>
                    <button className="btn-outline" onClick={handleLogout}>Log out</button>
                </div>
            </div>

                        <div className="card stat-card">
                <div className="stat-card-header">
                    <span className="stat-card-title">Units</span>
                    <button className="btn btn-primary sqr-btn" onClick={createUnit} disabled={isGenerating}>
                        {isGenerating ? "Generating..." : "Create a new unit!"}
                    </button>
                </div>
                {units.map((unit => (
                    <div className="list-row" key={unit.id}>
                        <span className="list-row-label">
                            {unit.theme} {unit.is_active && <span className="badge">Active</span>}
                        </span>
                        <button className="btn btn-load btn-anim" onClick={() => loadUnit(unit.id)}>
                            
                                <img className="use-icon" src={UseButton} />
                                <p>Load</p>
                            
                            
                            
                            </button>
                    </div>
                )))}
            </div>

            <div className="card stat-card">
                <div className="stat-card-header">
                    <span className="stat-card-title">Your Past Cohorts</span>
                </div>
                
                
                
                                {cohorts.map((cohort, index) => (
                    <div className="list-row" key={cohort.id}>
                        <span className="list-row-label">Cohort {index + 1}</span>
                        <button className="btn btn-load btn-anim" onClick={() => viewCohort(cohort.id)}>
                            <img className="use-icon" src={EyesButton} />
                            <p>View</p>
                        </button>
                    </div>
                ))}

                {viewedCohort && (
                    <div className="detail-panel">
                        <span className="stat-card-title">Cohort {cohorts.findIndex(cohort => cohort.id === viewedCohort.cohort.id) + 1}</span>
                        <div>
                            {viewedCohort.characters.map((character) => (
                                <span className="chip" key={character.id}>
                                    <span className="chip-hanzi">{character.hanzi}</span>
                                    <span className="chip-detail">{character.pinyin} · {character.meaning}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>


            <div className="card stat-card">
                <div className="stat-card-header">
                    <span className="stat-card-title">Your Practice Logs</span>
                </div>
                {practiceLogs.map((log) => (
                    <div className="list-row" key={log.id}>
                        <span className="list-row-label">{log.session_time.split("T")[0]}</span>
                        <button className="btn btn-load btn-anim" onClick={() => viewPracticeLog(log.id)}>
                            <img className="use-icon" src={EyesButton} />
                            <p>View</p>
                        </button>
                    </div>
                ))}

                {viewedLog && (
                    <div className="detail-panel">
                        <span className="stat-card-title">Log {viewedLog.id} - {viewedLog.session_time.split("T")[0]}</span>
                        {viewedLog.entries.map((entry) => (
                            <div key={entry.id}>{entry.hanzi} - written {entry.times_written} times</div>
                        ))}
                    </div>
                )}
            </div>




            



            <div className="card stat-card">
                <div className="stat-card-header">
                    <span className="stat-card-title">Character Bank</span>
                    <p>Your total vocab domain</p>
                </div>
                <div className="list-row">
                    <button className="btn-outline" onClick={() => fetchCharacters().then(refreshCohorts)}>Click to fetch Mandarin characterbank</button>
                    
                    <button className="btn-outline" onClick={() => postCharactersAI().then(refreshCohorts)}>Click to discover new characters using AI</button>

                    <button className="btn-danger" onClick={() => { setViewedLog(null); setViewedCohort(null); wipeAllData().then(refreshCohorts).then(refreshUnits).then(refreshPracticeLogs); }}>
                        Wipe all data
                    </button>
                </div>
            

                <div className="char-table-header">
                    <span className="char-table-hanzi">Hanzi</span>
                    <span className="char-table-pinyin-title">Pinyin</span>
                    <span className="char-table-meaning-title">Meaning</span>
                    <span className="char-table-strokes-title">Strokes</span>
                </div>
                {
                    characters.map((character) => (
                        <div className="char-table-row" key={character.id}>
                            <span className="char-table-hanzi">{character.hanzi}</span>
                            <span className="char-table-pinyin">{character.pinyin}</span>
                            <span className="char-table-meaning">{character.meaning}</span>
                            <span className="char-table-strokes">{character.strokec}</span>
                        </div>
                    ))
                }
           
            </div>



            {/* Archived raw display
            
             <ul>
                {
                    characters.map((character) => (
                        <li key={character.id}>
                            {character.hanzi} | {character.pinyin} | {character.meaning} | {character.strokec}
                        </li>
                    ))
                }
            </ul>*/
            
            }








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
            
            
        </div>
        
    )

}


export default Stats