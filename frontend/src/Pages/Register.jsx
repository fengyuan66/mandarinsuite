import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../common/AuthContext.jsx";

function Register() {
    const { register, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        register(email, password)
            .then((res) => {
                if (!res.ok) throw new Error("Registration failed");
                return login(email, password);
            })
            .then(() => navigate("/start"))
            .catch(() => setError("Could not register (email may already be in use)"));
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Register</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Register</button>
            {error && <p>{error}</p>}
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </form>
    );
}

export default Register;