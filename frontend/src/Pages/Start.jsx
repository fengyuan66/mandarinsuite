import { useEffect, useState } from "react";


import { useEffect, useState } from "react";

import {
advanceRound,
fetchCharacters,
postCharacters,
postCharactersAI,
fetchCurrentCohort,
fetchActiveUnit,
fetchCurrentRound,
createUnit,
} from "../common/functions.js";

import { NEXTSTATUS } from "../common/constants.js";

function Start(){



    const [characters, setCharacters] = useState([]);

    const[currentCohort, setCurrentCohort] = useState(null);
    const [cohortCharacters, setCohortCharacters] = useState([]);
    const[latestRound, setLatestRound] = useState(null);
    const[activeUnit, setActiveUnit] = useState(null);

    //wizard (slideshow) setup

    const [writingDictationContent, setWritingDictationContent] = useState(null);
    const [fibContent, setFibContent] = useState(null);

    

    //input setup
    const [storedhanzi, setstoredhanzi] = useState("");
    const [storedpinyin, setstoredpinyin] = useState("");
    const [storedmeaning, setstoredmeaning] = useState("");
    const [storedstrokec, setstoredstrokec] = useState("");

    return(




    )
}