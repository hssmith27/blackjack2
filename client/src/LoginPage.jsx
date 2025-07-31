import { useState } from "react";
import './LoginPage.css'

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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
                setError(data.message || "Login Failed");
            }
            else {
                alert("Logged in successfully!");
                // Redirect to game page
            }
        }
        catch (err) {
            console.error("Loggin error:", err);
            setError("Something went wrong");
        }
    }
    return (
        <div className="login">
            <h1>Login to 21 Tactics</h1>
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
            </form>
        </div>
    );
}