import {useState, useEffect} from "react";
import {useAppContext} from "../common/AppContext.jsx";

function Stats(){
    const {createUnit, fetchAllUnits, loadUnit, activeUnit} = useAppContext();
    const [units, setUnits] = useState([])
    const [cohorts, setCohorts] = useState([])
    const [viewedCohort, setViewedCohort] = useState(null)



    useEffect(() => {
        fetchAllUnits().then(setUnits);
        fetch("http://localhost:8000/cohort/all").then((res) => res.json()).then(setCohorts);
    }, [])

    function viewCohort(cohortID){
        fetch(`http://localhost:8000/cohort/%{cohortId}`)
        .then((res) => res.json())
        .then(setViewedCohort)
    }

    return (
        <div>
            <h1>Units</h1>
            <button onClick={createUnit}>Create a new unit!</button>
            <ul>
                {units.map((unit => (
                    <li key={unit.id}>
                        {unit.theme} {unit.is_active && "(active)"}
                        <button onClick={() => loadUnit(unit.id)}>Load</button>
                    </li>
                )))}
            </ul>
            <h1>View your past cohorts</h1>
            
            
            
            <ul>
                {cohorts.map((cohort) => (
                    <li key={cohort.id}>
                        Cohort {cohort.id}
                        <button onClick={() => viewCohort(cohort.id)}>View cohort</button>
                    </li>
                ))}
            </ul>
            
            {viewCohort && (
                <div>
                    <h2>Cohort {viewCohort.cohort.id}</h2>
                    <ul>
                        {viewedCohort.characters.map((character) => (
                            <li key={character.id}>{character.hanzi} | {character.pinyin} | {character.meaning}</li>
                        ))}
                    </ul>
                </div>
            )}


        </div>
    )

}


export default Stats