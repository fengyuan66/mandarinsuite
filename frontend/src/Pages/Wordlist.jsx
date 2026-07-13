import { useEffect, useState } from "react";

function Wordlist(){
    //words is the data (FRONTEND-SIDE), setWords is the setter
    const [words, setWords] = useState([]);
    
    //input setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");

    useEffect(() => {
        
    }, []);

    function fetchWords(){
        fetch("http://localhost:8000/wordbank")
        .then((res) => res.json())
        .then((data) => setWords(data));    //use setter to store data to words
    }

    function postWords(hanzi_in, pinyin_in, meaning_in, strokec_in){
        fetch("http://localhost:8000/wordbank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hanzi: hanzi_in, pinyin: pinyin_in, meaning: meaning_in, strokec: strokec_in})
        });
    }




    return(
        <div className="wordbankPage">
            <div className="getwords">
            <button onClick={fetchWords}>Click to fetch Mandarin wordbank</button>
            <ul>
                {
                    words.map((word) => (
                        <li key={word.id}>
                            {word.hanzi} | {word.pinyin} | {word.meaning} | {word.strokec}
                        </li>
                    ))
                }
            </ul>
            </div>
            <div className="addwords">
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

                <button onClick={() => postWords(storedhanzi,storedpinyin,storedmeaning,storedstrokec)}>
                    Submit
                </button>
            </div>
        </div>
        
    )
}