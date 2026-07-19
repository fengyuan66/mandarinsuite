import { createContext, useContext, useState } from "react";
import { NEXT_STATUS } from "./constants.js";
import { apiFetch } from "./api.js";

import { useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {

    //USESTATES

    const [characters, setCharacters] = useState([]);
    
    const[currentCohort, setCurrentCohort] = useState(null);
    const [cohortCharacters, setCohortCharacters] = useState([]);
    const[currentRound, setCurrentRound] = useState(null);
    const[activeUnit, setActiveUnit] = useState(null);

    //wizard (slideshow) setup

    const [writingDictationContent, setWritingDictationContent] = useState(null);
    const [fibContent, setFibContent] = useState(null);

        //loading accessory
    const [isGenerating, setIsGenerating] = useState(false);

    //input setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");
    
    const [unitReviewContent, setUnitReviewContent] = useState(null);
    const [freeWriteContent, setFreeWriteContent] = useState(null);


    //REFRESHER
    useEffect(() => {
        if (!currentRound) return;

        if (currentRound.status === "writing_dictation" && !writingDictationContent) {
            setIsGenerating(true);
            apiFetch(`/generation/writing-dication/${currentRound.id}`, { method: "POST" })
            .then((res) => res.json())
            .then((data) => { setWritingDictationContent(data); setIsGenerating(false);});
        }

        if (currentRound.status === "fib" && !fibContent) {
            setIsGenerating(true);
            apiFetch(`/generation/fib/${currentRound.id}`, { method: "POST" })
            .then((res) => res.json())
            .then((data) => {setFibContent(data); setIsGenerating(false);});
        }
    }, [currentRound]);


    //FUNCTIONS

    function wipeAllData(){
        return apiFetch("/admin/wipe", { method: "DELETE" })
        .then(() => {
            setActiveUnit(null);
            setCurrentRound(null);
            setCurrentCohort(null);
            setCohortCharacters([]);
            setCharacters([]);
            setWritingDictationContent(null);
            setFibContent(null);
            setUnitReviewContent(null);
            setFreeWriteContent(null);
        });
    }

    function finishUnit(){
        apiFetch(`/generation/unit_review/${activeUnit.id}`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => setUnitReviewContent(data))

        apiFetch(`/generation/free-write/${activeUnit.id}`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => setFreeWriteContent(data));

    }

    function startNextUnit(){
        apiFetch("/unit", {method: "POST"})
        .then((res) => res.json())
        .then((newUnit) => {
            setActiveUnit(newUnit)
            setUnitReviewContent(null)
            setFreeWriteContent(null)

            // POST /unit already creates the unit's first round server-side, so just
            // fetch it rather than creating a second (orphaned) round here.
            fetchCurrentRound(newUnit.id)
        })
    }
    
    function advanceRound(){
       const nextStatus = NEXT_STATUS[currentRound.status];

        /*if (currentRound.status == "dictation_offered"){
            fetch(`http://localhost:8000/generation/writing-dication/${currentRound.id}`, { method: "POST"})
            .then((res) => res.json())
            .then((data) => setWritingDictationContent(data))
        
        }

        if (currentRound.status == "writing_dictation"){
            fetch(`http://localhost:8000/generation/fib/${currentRound.id}`, { method: "POST"})
            .then((res) => res.json())
            .then((data) => setFibContent(data))
        
        }*/

        apiFetch(`/round/${currentRound.id}/status?new_status=${nextStatus}`, { method: "PATCH" })
        .then((res) => res.json())
        .then((data) => setCurrentRound(data))


    }

    function lookupCharacters(hanziList){
        return apiFetch("/characterbank/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(hanziList),
        }).then((res) => res.json());
    }

    function fetchAllUnits(){
        return apiFetch("/unit/all").then((res) => res.json());
    }

    function loadUnit(unitId){
        apiFetch(`/unit/${unitId}/activate`, { method: "PATCH" })
        .then((res) => res.json())
        .then((data) => {
            setActiveUnit(data);
            fetchCurrentRound(data.id);
        });
    }

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


    function fetchCharacters(){
        apiFetch("/characterbank")
        .then((res) => res.json())
        .then((data) => setCharacters(data));    //use setter to store data to characters
    }

    function postCharacters(hanzi_in, pinyin_in, meaning_in, strokec_in){
        apiFetch("/characterbank", {
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hanzi: hanzi_in, pinyin: pinyin_in, meaning: meaning_in, strokec: strokec_in})
        });
    }

    function postCharactersAI(True){
        apiFetch("/discover", {method: "POST"})
        .then((res) => res.json())
        .then((data) => {
            setCharacters((prev) => [...prev, ...data.created]);
            fetchCurrentCohort();
        });
    }



    function fetchCurrentCohort(){
        apiFetch("/cohort/current")
        .then((res)=> res.json())
        .then((data) => {

            //console.log("[DEBUG] /cohort/current response:", data);

            setCurrentCohort(data.cohort);
            setCohortCharacters(data.characters);
        })
    }


    function fetchCurrentRound(id = activeUnit.id){
        apiFetch(`/unit/${id}/round/current`)
        .then((res) => res.json())
        .then((data) => {
            setCurrentRound(data)
        })
    }

    function fetchActiveUnit(){
        apiFetch("/unit/active")
        .then((res) => res.json())
        .then((data) => {
            setActiveUnit(data)
            if (data != null){ //check for request URL formatting reasons
                fetchCurrentRound(data.id)
            }
        })
    }

    function createRound(){
        setIsGenerating(true);
        setWritingDictationContent(null);
        setFibContent(null);
        apiFetch(`/round?unit_id=${activeUnit.id}`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {setCurrentRound(data); setIsGenerating(false);});
    }

    function createUnit(){

        setIsGenerating(true);
        apiFetch("/unit", { method: "POST" })
        .then((res => res.json()))
        .then((data) => {
            setActiveUnit(data);
            setIsGenerating(false);
        })
    }

    
    async function addPracticeEntry(session_id, character_id, times_written){
        const response = await apiFetch(`/practicelog/practiceentry/${session_id}/${character_id}/${times_written}`, {method: "POST"})
        return response.json();
    }

    function createPracticeLog(practiceEntries){

        return apiFetch("/practicelog", {method: "POST"})
        .then((res => res.json()))
        .then((newPracticeLog) => {
            
            const entryRequests = practiceEntries.map((entry) => {
                return addPracticeEntry(
                    newPracticeLog.id,
                    entry.character_id,
                    entry.times_written
                )
            })

            return Promise.all(entryRequests)
                .then((createdEntries) => {
                    //copy entrydate and other fields from the new practiceLog (already handled here)
                    const completedPracticeLog = Object.assign({}, newPracticeLog)
                    
                    completedPracticeLog.practiceEntries = createdEntries
                    return completedPracticeLog
                })
        }
        )
        
    }

    function createPracticeLogRaw(characters, timesWritten) {
        return apiFetch("/practicelog", {
            method: "POST"
        })
        .then((res) => res.json())
        .then((newPracticeLog) => {
            const entryRequests = characters.map((character) =>
                addPracticeEntry(
                    newPracticeLog.id,
                    character.id,
                    Number(timesWritten)
                )
            );

            return Promise.all(entryRequests);
        });
    }
         
    


    const value = {
    activeUnit, currentRound, currentCohort, cohortCharacters, characters,
    writingDictationContent, fibContent, unitReviewContent, freeWriteContent,
    fetchActiveUnit, fetchCurrentRound, fetchCurrentCohort, fetchCharacters,
    postCharacters, postCharactersAI, createUnit, createRound, advanceRound,
    finishUnit, startNextUnit, wipeAllData, isGenerating, addPracticeEntry, createPracticeLog, createPracticeLogRaw, HanziDisplay, fetchAllUnits, loadUnit, lookupCharacters
    };

    return <AppContext.Provider value = {value}>{children}</AppContext.Provider>

}

export function useAppContext(){
    return useContext(AppContext)
}