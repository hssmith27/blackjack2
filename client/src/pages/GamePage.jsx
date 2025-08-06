import { createShoe, shuffle, calculateHandValue, isBust, isBlackjack } from '../utils/deck.js'
import { useUser } from '../UserContext'
import { useEffect } from 'react'
import Card from '../GameComponents/Card.jsx'

export default function GamePage() {
    const { chipCount, setChipCount, email, setEmail } = useUser();

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");

        if (!storedEmail) return;

        async function getChipCount() {
            const data = await fetchChipCount(storedEmail);

            if (data && data.success) {
                setEmail(storedEmail);
                setChipCount(data.chipCount);
            } 
            else {
                console.error("Failed to get chip count:", data?.message);
            }
        }

        getChipCount();
    }, []);

    async function fetchChipCount(storedEmail) {
        try {
            const res = await fetch(`http://localhost:3001/get-chip-count/${storedEmail}`);
            const data = await res.json();
            return data;
        } 
        catch (err) {
            console.error("Fetch chip count error:", err);
            return null;
        }
    }

    async function updateChipCount(chipChange) {
        try {
            const res = await fetch("http://localhost:3001/update-chip-count", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, chipChange })
            });

            if (!res.ok) {
                throw new Error("Server Error:", res.status);
            }

            const data = await res.json();

            if (data.success) {
                setChipCount(data.chipCount);
            }
            else {
                console.error("Update failed:", data.message || "Unknown error");
            }
        }
        catch (err) {
            console.error("Failed to update chips:", error);
        }
        
    }
    
    return (
        <div className="landing-page">
            <h1>{chipCount}</h1>
            <Card card={"10C"} hidden={true}/>
        </div>
    );
}