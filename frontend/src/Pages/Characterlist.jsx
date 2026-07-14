import { useEffect, useState } from "react";

function Characterlist(){
    //characters is the data (FRONTEND-SIDE), setCharacters is the setter
    const [characters, setCharacters] = useState([]);

    const[currentCohort, setCurrentCohort] = useState(null);
    const [cohortCharacters, setCohortCharacters] = useState([]);

    //input setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");

    useEffect(() => {
        fetchCurrentCohort();
    }, []);

    function fetchCharacters(){
        fetch("http://localhost:8000/characterbank")
        .then((res) => res.json())
        .then((data) => setCharacters(data));    //use setter to store data to characters
    }

    function postCharacters(hanzi_in, pinyin_in, meaning_in, strokec_in){
        fetch("http://localhost:8000/characterbank", {
            method: "POST",
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

            console.log("[DEBUG] /cohort/current response:", data);

            setCurrentCohort(data.cohort);
            setCohortCharacters(data.characters);
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
