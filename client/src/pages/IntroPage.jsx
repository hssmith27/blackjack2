import '../styles/LandingPages.css'
import { useNavigate } from 'react-router-dom'

export default function IntroPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <h1>Welcome to 21 Tactics!</h1>
            <button onClick={() => navigate("/login")}>Log in</button>
            <button onClick={() => navigate("/register")}>Register</button>
        </div>
    );
}