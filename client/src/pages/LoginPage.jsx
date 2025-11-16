import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from "../UserContext";
import '../styles/LandingPages.css'

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { setChipCount } = useUser();
    const navigate = useNavigate();

    /**
     * Handles login attempts
     */
    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");
        
        try {
            const res = await fetch ("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login failed");
            }
            else {
                localStorage.setItem("email", email);
                navigate("/game");
            }
        }
        catch (err) {
            console.error("Loggin error:", err);
            setError("Something went wrong");
        }
    }
    
    return (
        <div className="landing-page">
            <h1>Login to Cardist</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">
                    Submit
                </button>
                {error && <div className="error">{error}</div>}
                <p>Don't have an account yet? <a href = "/register">Register Here</a></p>
            </form>
        </div>
    );
}