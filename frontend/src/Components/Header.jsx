import {NavLink, useLocation} from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
function Header(){
    const navRef = useRef(null);
    return(
        <div className="header">
            <nav ref={navRef}>
                <NavLink to="/start" className={({ isActive }) => {
                    if (isActive){
                        return "active";
                    }
                    else{
                        return "false";
                    }
                }}>
                    Start!
                </NavLink>
                <NavLink to="/practice" className={({ isActive }) => {
                    if (isActive){
                        return "active";
                    }
                    else{
                        return "false";
                    }
                }}>
                    Practice
                </NavLink>
                <NavLink to="/dictation" className={({ isActive }) => {
                    if (isActive){
                        return "active";
                    }
                    else{
                        return "false";
                    }
                }}>
                    Dictation
                </NavLink>
                <NavLink to="/reading" className={({ isActive }) => {
                    if (isActive){
                        return "active";
                    }
                    else{
                        return "false";
                    }
                }}>
                    Reading
                </NavLink>
                <NavLink to="/fib" className={({ isActive }) => {
                    if (isActive){
                        return "active";
                    }
                    else{
                        return "false";
                    }
                }}>
                    FIB
                </NavLink>
                <NavLink to="/sentencedictation" className={({ isActive }) => {
                    if (isActive){
                        return "active";
                    }
                    else{
                        return "false";
                    }
                }}>
                    Sentence-Dictation
                </NavLink>
                
                <NavLink to="/stats" className={({ isActive }) => {
                    if (isActive){
                        return "active";
                    }
                    else{
                        return "false";
                    }
                }}>
                    Stats
                </NavLink>
            </nav>
        </div>
    )
}

export default Header