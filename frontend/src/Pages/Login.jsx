import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../common/AuthContext.jsx";
import RedDragon from "../assets/RedDragon.svg";

import "../css/Auth.css"



function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        login(email, password)
            .then(() => navigate("/start"))
            .catch(() => setError("Invalid email or password"))
            .finally(() => setSubmitting(false));
    }

    return (

        <div className="auth-page">

            <div className="auth-core">
                <img src={RedDragon} className="auth-core-logo" />
                <span className="auth-core-name">MandarinSuite</span>
            </div>

            <form className="card auth-card" onSubmit={handleSubmit}>
                <label className="auth-field">

                    <span className="auth-label">Email</span>
                    <input className="input auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

                </label>

                <label className="auth-field">

                    <span className="auth-label">Password</span>
                    <input className="input auth-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    
                </label>
                
                <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Log in"}
                </button>


                {error && <p className="auth-error">{error}</p>}
                
                <p className="auth-footer">No account? <Link to="/register" className="auth-link">Register</Link></p>
            </form>


        </div>

            


    );
}

export default Login;