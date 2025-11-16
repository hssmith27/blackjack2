import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/LandingPages.css'

export default function RegistrationPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    /**
     * Handles registration attempts
     */
    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");
        
        try {
            const res = await fetch ("http://localhost:3001/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Registration failed");
            }
            else {
                alert("Registered successfully!");
                navigate("/login");
            }
        }
        catch (err) {
            console.error("Registration error:", err);
            setError("Something went wrong");
        }
    }
    return (
        <div className="landing-page">
            <h1>Register for Cardist</h1>
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
                {error && <div className="login-error">{error}</div>}
                <p>Already have an account? <a href = "/login">Login Here</a></p>
            </form>
        </div>
    );
}