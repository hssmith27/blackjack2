import { createShoe, shuffle, calculateHandValue, isBust, isBlackjack, canSplit } from '../utils/deck.js'
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
    const [gameState, setGameState] = useState("");
    const [gameOver, setGameOver] = useState(false);

    // Maintain chip count
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

    /**
     * Gathers the chip count associated with a given email
     * @param {string} storedEmail the email whose chip count is checked
     * @returns chip count associated with a given email
     */
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

    /**
     * Updates chip count in SQL table, if succesful, then updates the chip count state
     * @param {int} chipChange the change in chips inputted
     */
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

    // Creates new shoe when out of cards
    useEffect(() => {
        if (deck.length === 0) {
            setDeck(shuffle(createShoe(6)));
        }
    }, [deck]);

    // Evalutes wins and losses
    useEffect(() => {
        const dealerHandVal = calculateHandValue(dealerHand);
        const playerHandVal = calculateHandValue(playerHand);

        // Check Blackjack
        if (isBlackjack(dealerHand)) {
            if (isBlackjack(playerHand)) {
                updateChipCount(wager);
                setGameState("Push");
                setGameOver(true);
            }
            else {
                setGameState("Dealer Blackjack");
                setGameOver(true);
            }
        }
        else if (isBlackjack(playerHand)) {
            updateChipCount(Math.round(wager * 5 / 2));
            setGameState("Player Blackjack");
            setGameOver(true);
        }

        // Check for busts
        else if (isBust(playerHand)) {
            setGameState("Player Bust");
            setGameOver(true);
        }
        else if (isBust(dealerHand)) {
            updateChipCount(Math.round(wager * 2));
            setGameState("Dealer Bust");
            setGameOver(true);
        }

        // Check after player stands or doubles down
        else if (gameOver) {
            if (dealerHandVal > playerHandVal) {
                setGameState("Dealer Win");
            }
            else if (dealerHandVal < playerHandVal) {
                updateChipCount(wager * 2);
                setGameState("Player Win");
            }
            else {
                updateChipCount(wager);
                setGameState("Push");
            }
        }
    }, [playerHand, dealerHand, gameOver]);

    /**
     * Deals cards to player and dealer
     * @param {int} numPlayer number of cards to be dealt to player
     * @param {int} numDealer number of cards to be dealt to dealer
     */
    function dealCards(numPlayer, numDealer) {
        const playerCards = deck.slice(-(numPlayer));
        const dealerCards = deck.slice(-(numPlayer + numDealer), -(numPlayer));

        setDeck(deck.slice(0, -(numPlayer + numDealer)));

        setPlayerHand([...playerHand, ...playerCards]);
        setDealerHand([...dealerHand, ...dealerCards]);
    }

    /**
     * Handles setup of game page
     */
    function setup(e) {
        e.preventDefault();
        updateChipCount(-wager);

        setShowHands(true);

        dealCards(2, 2);
    }

    /**
     * Button functionality for hit
     */
    const handleHit = () => {
        if (!gameOver) {
            dealCards(1, 0);
        }
    }

    /**
     * Handles dealer action after player action ends
     */
    const playDealer = () => {
        setDealerHand(prevDealerHand => {
            setDeck(prevDeck => {
                let newDealerHand = [...prevDealerHand];
                let newDeck = [...prevDeck];

                while (calculateHandValue(newDealerHand) < 17 && newDeck.length > 0) {
                    const card = newDeck.pop();
                    newDealerHand.push(card);
                }

                setDealerHand(newDealerHand);

                return newDeck;
            });

            return prevDealerHand;
        });
    };

    /**
     * Button functionality for stand
     */
    const handleStand = () => {
        if (!gameOver) {
            setGameOver(true);
            playDealer();
        }
    }

    // TODO: Make wager go back to 1/2 value after double down round
    // Could just use a state to track if someone doubled down, seems
    // like a bad solution though
    /**
     * Button functionality for double down
     */
    const handleDoubleDown = () => {
        if (!gameOver && wager <= chipCount) {
            setGameOver(true);
            updateChipCount(-wager);
            setWager(wager * 2);

            setPlayerHand(prev => {
                const newHand = [...prev];
                const card = deck[deck.length - 1];
                setDeck(deck.slice(0, deck.length - 1));
                newHand.push(card);

                if (!isBust(newHand)) {
                    playDealer();
                }

                return newHand;
            })
        }
    }
    
    /**
     * Button functionality for split
     */
    const handleSplit = () => {
        if (!gameOver && canSplit(playerHand)) {
            alert("SPLIT");
        }
    }

    /**
     * Button functionality for resetting the game
     */
    const reset = () => {
        setShowHands(false);
        setGameState("");
        setGameOver(false);

        setDealerHand([]);
        setPlayerHand([]);
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
                        <Hand hand={dealerHand} isDealer={true} hideDealerCard={!gameOver}/>
                        <h2>Player</h2>
                        <Hand hand={playerHand} isDealer={false} hideDealerCard={false}/>
                        <div className="game-actions">
                            <button onClick={handleHit}>Hit</button>
                            <button onClick={handleStand}>Stand</button>
                            <button onClick={handleDoubleDown}>Double Down</button>
                            <button onClick={handleSplit}>Split</button>
                        </div>
                        {gameOver && <div className="game-state">{gameState}</div>}
                        {gameOver && <button className="reset" onClick={reset}>Reset</button>}
                    </div>
                    
                </>
            )}
        </div>
    );
}