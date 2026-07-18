import { useState } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import HanziDisplay from "../Components/HanziDisplay.jsx";

function Practice(){
    const {cohortCharacters, createPracticeLog} = useAppContext();
    const [useCohort, setUseCohort] = useState(true);
    const [manualInput, setManualInput] = useState("");
    const [counts, setCounts] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const activeCharacters = useCohort
        ? cohortCharacters
        : Array.from(manualInput).filter((ch) => ch.trim() !== "").map((hanzi) => ({ hanzi, id: null }));

    function updateCount(characterId, value) {
        setCounts((prev) => ({ ...prev, [characterId]: value }));
    }

    function handleSubmit() {
        const entries = activeCharacters
            .filter((c) => c.id !== null)
            .map((c) => ({ character_id: c.id, times_written: Number(counts[c.id]) || 0 }))
            .filter((e) => e.times_written > 0);

        createPracticeLog(entries).then(() => setSubmitted(true));
    }

    function reset() {
        setCounts({});
        setSubmitted(false);
        setManualInput("");
    }

    return (
        <div>
            <h1>Write each character 10-15 times and then a word with it</h1>

            <label>
                <input type="checkbox" checked={useCohort} onChange={(e) => setUseCohort(e.target.checked)} />
                Use current cohort's characters
            </label>

            {!useCohort && (
                <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="type characters to practice, e.g. 你好"
                />
            )}

            {activeCharacters.map((character, i) => (
                <div key={character.id ?? i}>
                    <HanziDisplay hanzi={character.hanzi} />
                    {character.id !== null && (
                        <input
                            type="number"
                            min="0"
                            value={counts[character.id] ?? ""}
                            onChange={(e) => updateCount(character.id, e.target.value)}
                            placeholder="times written"
                        />
                    )}
                </div>
            ))}

            {useCohort && <button onClick={handleSubmit}>Submit practice log</button>}
            <button onClick={reset}>Reset</button>
            {submitted && <p>Logged!</p>}
        </div>
    );
}

export default Practice;