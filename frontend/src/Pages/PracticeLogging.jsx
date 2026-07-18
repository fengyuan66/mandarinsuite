import { useState } from "react"
import {useAppContext} from "../common/AppContext.jsx"

function PracticeLogging(){
    const {cohortCharacters, createPracticeLog} = useAppContext();
    const [timesWritten, setTimesWritten] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(){
        const count = Number(timesWritten) || 0

        if (count <= 0) return

        const entries = cohortCharacters.map((character) => ({
            character_id: character.id,
            times_written: count
        }))

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
                </div>
            ))}

            <label htmlFor="timesWritten">Times written (applies to every character above):</label>
            <input
                id="timesWritten"
                type="number"
                min="0"
                placeholder="0"
                value={timesWritten}
                onChange={(change) => setTimesWritten(change.target.value)}
            />

            <button onClick={handleSubmit}>Submit practice log</button>
            {submitted && <p>Logged!</p>}
        </div>
    )
}

export default PracticeLogging