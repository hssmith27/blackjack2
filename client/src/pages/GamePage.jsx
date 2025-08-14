import { createShoe, shuffle, calculateHandValue, isBust, isBlackjack } from '../utils/deck.js'
import { useUser } from '../UserContext'
import { useEffect, useState } from 'react'
import Hand from '../GameComponents/Hand.jsx'
import '../styles/GamePage.css'

export default function GamePage() {
    const { chipCount, setChipCount, email, setEmail } = useUser();
    const [dealerHand, setDealerHand] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [wager, setWager] = useState(0);
    const [showHands, setShowHands] = useState(false);
    const [deck, setDeck] = useState(() => shuffle(createShoe(6)));

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

    // Creates new shoe when out of cards
    useEffect(() => {
        if (deck.length === 0) {
            setDeck(shuffle(createShoe(6)));
        }
    }, [deck]);

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

    function dealCards(numPlayer, numDealer) {
        const playerCards = deck.slice(-(numPlayer));
        const dealerCards = deck.slice(-(numPlayer + numDealer), -(numPlayer));

        setDeck(deck.slice(0, -(numPlayer + numDealer)));

        setPlayerHand([...playerHand, ...playerCards]);
        setDealerHand([...dealerHand, ...dealerCards]);
    }

    function setup(e) {
        e.preventDefault();

        setDealerHand([]);
        setPlayerHand([]);

        dealCards(2, 2);
        
        updateChipCount(-wager);

        setShowHands(true);
    }
    
    return (
        <div className="game-page">
            <p className="chip-counter">{chipCount}</p>

            {!showHands && (
                <>
                    <div className="game-setup">
                        <h2>Place Your Bet:</h2>
                        <form onSubmit={setup}>
                            <input
                                type="number"
                                value={wager}
                                onChange={(e) => setWager(e.target.value)}
                                required
                                min="1"
                                max={chipCount}
                            />
                            <button type="submit">
                                Deal
                            </button>
                        </form>
                    </div>
                </>
            )}
            
            {showHands && (
                <>
                    <div className="game-elements">
                        <h2>Dealer</h2>
                        <Hand hand={dealerHand} isDealer={true} hideDealerCard={true}/>
                        <h2>Player</h2>
                        <Hand hand={playerHand} isDealer={false} hideDealerCard={false}/>
                        <div className="game-actions">
                            <button>Hit</button>
                            <button>Stand</button>
                            <button>Double Down</button>
                            <button>Split</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}