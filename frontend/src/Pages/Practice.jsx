    import { useState, useEffect, useRef } from "react";
    import { useAppContext } from "../common/AppContext.jsx";
    import HanziWriter from "hanzi-writer";
    import "../css/Practice.css"
    import "../common/theme.css"

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

    const [masterCount, setMasterCount] = useState("");

    function applyMasterCount() {
    const value = Number(masterCount) || 0;
    setCounts((prev) => {
        const updated = { ...prev };
        activeCharacters.forEach((character) => {
            const key = character.id ?? character.hanzi;
            updated[key] = value;
        });
        return updated;
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

    return (
    <div>
        <div className="drillpage-core">
            <h1 className="page-title">Practice</h1>
            <p className="page-subtitle">Write each character 10-15 times, then a word using it.</p>
        </div>
        

        <div className="controls-bar">
            <label className="toggle-label">
                <input type="checkbox" className="toggle" checked={useCohort} onChange={(e) => setUseCohort(e.target.checked)} />
                Use current cohort's characters
            </label>

            <div className="divider" />

            <div className="bulk-apply">
                <input
                    type="number"
                    min="0"
                    className="bulk-input"
                    value={masterCount}
                    onChange={(e) => setMasterCount(e.target.value)}
                    placeholder="times written (all characters)"
                />
                <button className="btn btn-secondary apply-btn" onClick={applyMasterCount}>Apply to all!</button>
            </div>
        </div>

        {!useCohort && (
            <input
                type="text"
                className="manual-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="type characters to practice, e.g: 我爱你"
            />
        )}
        <div className="character-grid">
            {activeCharacters.map((character, i) => {
                const key = character.id ?? character.hanzi;
                return (
                    <div className="character-card" key={key ?? i}>
                        <HanziDisplay hanzi={character.hanzi} />
                        <input
                            type="number"
                            min="0"
                            className="count-input"
                            value={counts[key] ?? ""}
                            onChange={(e) => updateCount(key, e.target.value)}
                            placeholder="times written"
                        />
                    </div>
                );
            })}
        </div>
        

        <div className="actions-row">
            <button className="btn btn-primary submit-btn" onClick={handleSubmit}>Submit practice log</button>
            <button className="link-quiet" onClick={reset}>Reset</button>
            {submitted && <p className="success-popup">Logged!</p>}
        </div>

        
    </div>
    );
    }

    export default Practice;