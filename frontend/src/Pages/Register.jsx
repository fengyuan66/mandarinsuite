import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../common/AuthContext.jsx";

import RedDragon from "../assets/RedDragon.svg";

import "../css/Auth.css"


function Register() {
    const [submitting, setSubmitting] = useState(false);
    const { register, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        register(email, password)
            .then((res) => {
                if (!res.ok) throw new Error("Registration failed");
                return login(email, password);
            })
            .then(() => navigate("/start"))
            .catch(() => setError("Could not register (email may already be in use)"))
            .finally(() => setSubmitting(false));
    }

    return (
    <div className="auth-page">
        <div className="auth-core">
            <img src={RedDragon} alt="" className="auth-core-logo" />
            <span className="auth-core-name">MandarinSuite</span>
        </div>

        <form className="card auth-card" onSubmit={handleSubmit}>
            <label className="auth-field">
                <span className="auth-label">Email</span>
                <input className="input auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="auth-field">
                <span className="auth-label">Password</span>
                <input className="input auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>

            <button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
                {submitting ? "Registering..." : "Register"}
            </button>            

            {error && <p className="auth-error">{error}</p>}

            <p className="auth-footer">Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
        </form>
    </div>
);
}

export default Register;