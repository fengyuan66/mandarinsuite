import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../common/AuthContext.jsx";

function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        login(email, password)
            .then(() => navigate("/start"))
            .catch(() => setError("Invalid email or password"));
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Log in</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Log in</button>
            {error && <p>{error}</p>}
            <p>No account? <Link to="/register">Register</Link></p>
        </form>
    );
}

export default Login;