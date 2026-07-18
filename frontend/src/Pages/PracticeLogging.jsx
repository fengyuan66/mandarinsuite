import { useState } from "react"
import {useAppContext} from "../common/AppContext.jsx"

function PracticeLogging(){
    const {cohortCharacters, createPracticeLog} = useAppContext();
    const [counts, setCounts] = useState({});
    const [submitted, setSubmitted] = useState(false);

    function updateCount(chracterID, value){
        setCounts((prev) => ({ ...prev, [characterID]: value}))
    }

    function handleSubmit(){
        const entries = []

        for(const character of cohortCharacters) {
            const timesWritten = Number(counts[character.id]) || 0

            if (timesWritten > 0){
                entries.push({
                    character_id: character.id,
                    times_written: timesWritten
                })
            }

        }
        
        createPracticeLog(entries)
        .then(() => {
            setSubmitted(true)
        })

    }

    return (
        <div className = "practicePage">
            <h1>Log your practice!</h1>
            {cohortCharacters.map((character) => (
                <div key={character.id} className="practiceRow">
                    <span>{character.hanzi} ({character.pinyin})</span>
                    <input
                        type="number"
                        min= "0"
                        value = {counts[character.id] ?? ""}
                        onChange = {(change) => updateCount(character.id, change.target.value)}
                    />
                </div>
            ))}
            
            <button onClick = {handleSubmit}>Submit practice log</button>
            {submitted && <p>Logged!</p>}
        </div>
    )

}

export default PracticeLogging