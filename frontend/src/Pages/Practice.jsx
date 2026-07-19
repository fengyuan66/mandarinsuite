import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import HanziWriter from "hanzi-writer";



function Practice(){
    const {cohortCharacters, createPracticeLog, characters, fetchCharacters, lookupCharacters} = useAppContext();
    const [useCohort, setUseCohort] = useState(true);
    const [manualInput, setManualInput] = useState("");
    const [counts, setCounts] = useState({});
    const [submitted, setSubmitted] = useState(false);

    

   const manualCharacters = Array.from(manualInput).filter((ch) => /[\u4e00-\u9fff]/.test(ch)).map((hanzi) => ({ hanzi }));

    const activeCharacters = useCohort 
    ? cohortCharacters 
    : manualCharacters;

    function updateCount(characterId, value) {
        setCounts((prev) => ({ ...prev, [characterId]: value }));
    }

    function handleSubmit() {
        if (useCohort) {
            const entries = cohortCharacters
                .map((c) => ({ character_id: c.id, times_written: Number(counts[c.id]) || 0 }))
                .filter((e) => e.times_written > 0);

            createPracticeLog(entries).then(() => setSubmitted(true));
            return;
        }

        const typedHanzi = manualCharacters.map((c) => c.hanzi);
        lookupCharacters(typedHanzi).then((results) => {
            const entries = typedHanzi
                .filter((hanzi) => results[hanzi] !== null)
                .map((hanzi) => ({
                    character_id: results[hanzi].id,
                    times_written: Number(counts[hanzi]) || 0
                }))
                .filter((e) => e.times_written > 0);

            createPracticeLog(entries).then(() => setSubmitted(true));
        });
    }

    function reset() {
        setCounts({});
        setSubmitted(false);
        setManualInput("");
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

        {activeCharacters.map((character, i) => {
            const key = character.id ?? character.hanzi;
            return (
                <div key={key ?? i}>
                    <HanziDisplay hanzi={character.hanzi} />
                    <input
                        type="number"
                        min="0"
                        value={counts[key] ?? ""}
                        onChange={(e) => updateCount(key, e.target.value)}
                        placeholder="times written"
                    />
                </div>
            );
        })}
        

            <button onClick={handleSubmit}>Submit practice log</button>
            <button onClick={reset}>Reset</button>
            {submitted && <p>Logged!</p>}
        </div>
    );
}

export default Practice;