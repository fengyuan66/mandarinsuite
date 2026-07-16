import { useEffect, useState } from "react";

function Characterlist(){
    //display setup
    
    //characters is the data (FRONTEND-SIDE), setCharacters is the setter
    const [characters, setCharacters] = useState([]);

    const[currentCohort, setCurrentCohort] = useState(null);
    const [cohortCharacters, setCohortCharacters] = useState([]);
    const[latestRound, setLatestRound] = useState(null);
    const[activeUnit, setActiveUnit] = useState(null);

    //wizard (slideshow) setup

    const [writingDictationContent, setWritingDictationContent] = useStatee(null);
    const [fibContent, setFibContent] = useState(null);

    const NEXT_STATUS = { //FIXED STATUS FOR WHAT STATUS COMES NEXT FOR SMOOTH CHAIN WORKFLOW
        cohort_ready: "practicing",
        practicing: "dictation_offered",
        dictation_offered: "writing_dictation",
        fib: "complete",
    }

    //input setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");

    useEffect(() => {
        fetchCurrentCohort();
        fetchActiveUnit();
        
    }, []);


    function advanceRound(){
        currentRound = fetchCurrentRound()
        const nextStatus = NEXT_STATUS[currentRound.status]

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




    function fetchCharacters(){
        fetch("http://localhost:8000/characterbank")
        .then((res) => res.json())
        .then((data) => setCharacters(data));    //use setter to store data to characters
    }

    function postCharacters(hanzi_in, pinyin_in, meaning_in, strokec_in){
        fetch("http://localhost:8000/characterbank", {
            
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hanzi: hanzi_in, pinyin: pinyin_in, meaning: meaning_in, strokec: strokec_in})
        });
    }

    function postCharactersAI(True){
        fetch("http://localhost:8000/discover", {method: "POST"})
        .then((res) => res.json())
        .then((data) => {
            setCharacters((prev) => [...prev, ...data.created]);
            fetchCurrentCohort();
        });
    }



    function fetchCurrentCohort(){
        fetch("http://localhost:8000/cohort/current")
        .then((res)=> res.json())
        .then((data) => {

            //console.log("[DEBUG] /cohort/current response:", data);

            setCurrentCohort(data.cohort);
            setCohortCharacters(data.characters);
        })
    }

    function fetchActiveUnit(){
        fetch("http://localhost:8000/unit/active")
        .then((res) => res.json())
        .then((data) => {

            console.log("[DEBUG] /unit/ current response:", data)

            setActiveUnit(data)

        })
    }


    function fetchCurrentRound(){
        fetch(`http://localhost:8000/unit/${activeUnit.id}/round/current`)
        .then((res) => res.json())
        .then((data) => {
            setLatestRound(data)
        })
    }

    function fetchActiveUnit(){
        fetch("http://localhost:8000/unit/active")
        .then((res) => res.json())
        .then((data) => {
            setActiveUnit(data)
            if (data != null){ //check for request URL formatting reasons
                fetchCurrentRound()
            }
        })
    }

    function createUnit(){
        
        fetch("http://localhost:8000/unit", { method: "POST" })
        .then((res => res.json()))
        .then((data) => {
            setActiveUnit(data)
        })
    }

    


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
