import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../common/AppContext.jsx";
import HanziWriter from "hanzi-writer";

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

function Practice(){
    const {cohortCharacters, createPracticeLog, characters, fetchCharacters} = useAppContext();
    const [useCohort, setUseCohort] = useState(true);
    const [manualInput, setManualInput] = useState("");
    const [counts, setCounts] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchCharacters()
    }, [])

   const activeCharacters = useCohort
    ? cohortCharacters
    : Array.from(manualInput).filter((ch) => ch.trim() !== "").map((hanzi) => {
        const found = characters.find((c) => c.hanzi === hanzi);
        return found ? found : { hanzi, id: null, notFound: true };
    });

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

            {activeCharacters.map((character, i) => (
            <div key={character.id ?? i}>
                {character.notFound ? (
                    <p>⚠️WARNING⚠️: '{character.hanzi}' IS NOT IN OUR DATABASE YET... Apologies!</p>
                ) : (
                    <>
                        <HanziDisplay hanzi={character.hanzi} />
                        <input
                            type="number"
                            min="0"
                            value={counts[character.id] ?? ""}
                            onChange={(e) => updateCount(character.id, e.target.value)}
                            placeholder="times written"
                        />
                    </>
                )}
            </div>
        ))}

            {hasSubmittable && <button onClick={handleSubmit}>Submit practice log</button>}
            <button onClick={reset}>Reset</button>
            {submitted && <p>Logged!</p>}
        </div>
    );
}

export default Practice;