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