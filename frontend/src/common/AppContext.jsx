import { createContext, useContext, useState } from "react";
import App from "../App";

const AppContext = createContext(null);

export function AppProvider({ children }) {

    //USESTATES

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
    
    //FUNCTIONS
    

    
    export function advanceRound(){
        currentRound = fetchCurrentRound()
        const nextStatus = NEXT_STATUS[fetchCurrentRound().status]

        if (currentRound.status == "dictation_offered"){
            fetch(`http://localhost:8000/generation/writing-dication/${currentRound.id}`, { method: "POST"})
            .then((res) => res.json())
            .then((data) => setWritingDictationContent(data))
        
        }

        if (currentRound.status == "writing_dictation"){
            fetch(`http://localhost:8000/generation/fib/${currentRound.id}`, { method: "POST"})
            .then((res) => res.json())
            .then((data) => setWritingDictationContent(data))
        
        }

        fetch(`http://localhost:8000/round/${currentRound.id}/status?new_status=${nextStatus}`, { method: "PATCH" })
        .then((res) => res.json())
        .then((data) => setCurrentRound(data))
        

    }




    export function fetchCharacters(){
        fetch("http://localhost:8000/characterbank")
        .then((res) => res.json())
        .then((data) => setCharacters(data));    //use setter to store data to characters
    }

    export function postCharacters(hanzi_in, pinyin_in, meaning_in, strokec_in){
        fetch("http://localhost:8000/characterbank", {
            
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hanzi: hanzi_in, pinyin: pinyin_in, meaning: meaning_in, strokec: strokec_in})
        });
    }

    export function postCharactersAI(True){
        fetch("http://localhost:8000/discover", {method: "POST"})
        .then((res) => res.json())
        .then((data) => {
            setCharacters((prev) => [...prev, ...data.created]);
            fetchCurrentCohort();
        });
    }



    export function fetchCurrentCohort(){
        fetch("http://localhost:8000/cohort/current")
        .then((res)=> res.json())
        .then((data) => {

            //console.log("[DEBUG] /cohort/current response:", data);

            setCurrentCohort(data.cohort);
            setCohortCharacters(data.characters);
        })
    }


    export function fetchCurrentRound(id = activeUnit.id){
        fetch(`http://localhost:8000/unit/${id}/round/current`)
        .then((res) => res.json())
        .then((data) => {
            setCurrentRound(data)
        })
    }

    export function fetchActiveUnit(){
        fetch("http://localhost:8000/unit/active")
        .then((res) => res.json())
        .then((data) => {
            setActiveUnit(data)
            if (data != null){ //check for request URL formatting reasons
                fetchCurrentRound(data.id)
            }
        })
    }

    export function createUnit(){
        
        fetch("http://localhost:8000/unit", { method: "POST" })
        .then((res => res.json()))
        .then((data) => {
            setActiveUnit(data)
        })
    }

    const value = {
        activeUnit, currentRound, currentCohort, cohortCharacters, characters,
        writingDictationContent, fibContent,
        fetchActiveUnit, fetchCurrentRound, fetchCurrentCohort, fetchCharacters,
        postCharacters, postCharactersAI, createUnit, advanceRound,
    };

    return <AppContext.Provider value = {value}>{children}</AppContext.Provider>

}

export function useAppContext(){
    return useContext(AppContext)
}