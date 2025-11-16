import { createShoe, shuffle, calculateHandValue, isBust, isBlackjack, canSplit, cardValue } from '../utils/deck.js'
import { useUser } from '../UserContext'
import { useEffect, useState } from 'react'
import Hand from '../GameComponents/Hand.jsx'
import PlayerHands from '../GameComponents/PlayerHands.jsx'
import '../styles/GamePage.css'

// Number of decks in the shoe
const NUM_DECKS = 6;

export default function GamePage() {
    // Cards
    const [dealerHand, setDealerHand] = useState([]);
    const [playerHands, setPlayerHands] = useState([[]]);
    const [deck, setDeck] = useState(() => shuffle(createShoe(NUM_DECKS)));

    // Game Evaluation and Pay
    const [wager, setWager] = useState(0);
    const [payouts, setPayouts] = useState([]);

    // Game Status
    const [showHands, setShowHands] = useState(false);  
    const [gameState, setGameState] = useState([]);
    const [dealerAction, setDealerAction] = useState(false);
    const [currentHand, setCurrentHand] = useState(0);
    const [handOver, setHandOver] = useState([false]);
    const [gameOver, setGameOver] = useState(false);
    const [pendingDD, setPendingDD] = useState(false);

    // Card counting states
    const [count, setCount] = useState(0);
    const [showCount, setShowCount] = useState(false);

    // User context
    const { chipCount, setChipCount, email, setEmail } = useUser();

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

    // Creates new shoe when halfway through the current shoe
    useEffect(() => {
        if (deck.length <= (NUM_DECKS * 26)) {
            setDeck(shuffle(createShoe(6)));
            setCount(0);
        }
    }, [deck]);

    // Checks when all hands are done
    useEffect(() => {
        // Checks if last hand is done
        if (handOver[handOver.length - 1]) {
            if (dealerAction) {
                playDealer();
            }
            // Add to count for hidden dealer card
            setCount(prevCount => prevCount + cardValue(dealerHand[1]));

            setGameOver(true);
        }
    }, [handOver]);

    // Payouts
    useEffect(() => {
        const numHands = playerHands.length;

        if (gameOver) {
            const updatedGameState = [...gameState];

            for (let i = 0; i < numHands; i++) {
                const dealerHandVal = calculateHandValue(dealerHand);
                const playerHandVal = calculateHandValue(playerHands[i]);

                const playerHand = playerHands[i];
                const payout = payouts[i];

                // Check Blackjack Payouts, can only happen with one hand
                if (isBlackjack(dealerHand, 1)) {
                    if (isBlackjack(playerHand, numHands)) {
                        updateChipCount(payout);
                        updatedGameState[i] = "Push";
                    }
                    else {
                        updatedGameState[i] = "Dealer Blackjack";
                    }
                }
                else if (isBlackjack(playerHand, numHands)) {
                    updateChipCount(Math.round(payout * (5 / 2)));
                    updatedGameState[i] = "Player Blackjack";
                }

                // Check for busts
                else if (isBust(playerHand)) {
                    updatedGameState[i] = "Player Bust";
                }
                else if (isBust(dealerHand)) {
                    updateChipCount(Math.round(payout * 2));
                    updatedGameState[i] = "Dealer Bust";
                }

                // Cover remaining values
                else if (gameOver) {
                    if (dealerHandVal > playerHandVal) {
                        updatedGameState[i] = "Dealer Win";
                    }
                    else if (dealerHandVal < playerHandVal) {
                        updateChipCount(payout * 2);
                        updatedGameState[i] = "Player Win";
                    }
                    else {
                        updateChipCount(payout);
                        updatedGameState[i] = "Push";
                    }
                }
            }

            setGameState(updatedGameState);
        }
    }, [gameOver]);

    /**
     * Ends the current hand
     */
    const endHand = () => {
        if (!isBust(playerHands[currentHand]) && !isBlackjack(playerHands[currentHand], playerHands.length)) { 
            setDealerAction(true);
        }

        const newHandOver = [...handOver];
        newHandOver[currentHand] = true
        setHandOver(newHandOver);
        setCurrentHand(currentHand + 1);
    }

    // Evalutes wins and losses
    useEffect(() => {
        const playerHand = playerHands[currentHand];

        if (currentHand < playerHands.length) {
            if (isBust(playerHand) || isBust(dealerHand) || isBlackjack(dealerHand, 1) || isBlackjack(playerHand, playerHands.length)) {
                endHand();
            }
        }
    }, [playerHands]);

    /**
     * Deals cards to player and dealer
     * @param {int} numPlayer number of cards to be dealt to player
     * @param {int} numDealer number of cards to be dealt to dealer
     */
    function dealCards(numPlayer, numDealer) {
        let addedCount = 0;
        const playerCards = deck.slice(-(numPlayer));
        const dealerCards = deck.slice(-(numPlayer + numDealer), -(numPlayer));

        setDeck(deck.slice(0, -(numPlayer + numDealer)));
        setDealerHand([...dealerHand, ...dealerCards]);

        const newPlayerHands = [...playerHands];
        newPlayerHands[currentHand] = [...newPlayerHands[currentHand], ...playerCards];
        setPlayerHands(newPlayerHands);

        // Count face up dealer card
        if (dealerCards.length == 2) {
            addedCount += cardValue(dealerCards[0]);
        }
        for (let i = 0; i < playerCards.length; i++) {
            addedCount += cardValue(playerCards[i]);
        }
        setCount(count + addedCount);
    }

    /**
     * Handles setup of game page
     */
    function setup(e) {
        e.preventDefault();

        updateChipCount(-wager);
        setPayouts([wager]);

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
        let addedCount = 0;

        let newDealerHand = [...dealerHand];
        let newDeck = [...deck];

        while (calculateHandValue(newDealerHand) < 17) {
            const card = newDeck.pop();
            newDealerHand.push(card);
            addedCount += cardValue(card);
        }

        setCount(prevCount => prevCount + addedCount);
        setDealerHand(newDealerHand);
        setDeck(newDeck);

        return newDeck;
    };

    /**
     * Button functionality for stand
     */
    const handleStand = () => {
        if (!gameOver) {
            endHand();
        }
    }

    // Ensures double down card is dealt in time
    useEffect(() => {
        if (pendingDD) {
            endHand();
            setPendingDD(false);
        }
    }, [pendingDD]);

    /**
     * Button functionality for double down
     */
    const handleDoubleDown = () => {
        if (!gameOver && wager <= chipCount && playerHands[currentHand].length == 2) {
            updateChipCount(-wager);

            const newPayouts = [...payouts];
            newPayouts[currentHand] = [newPayouts[currentHand] * 2];
            setPayouts(newPayouts);

            dealCards(1, 0);

            setPendingDD(true);
        }
    }
    
    /**
     * Button functionality for split
     */
    const handleSplit = () => {
        if (!gameOver && canSplit(playerHands[currentHand])) {
            updateChipCount(-wager);
            setHandOver([...handOver, false]);
            setPayouts([...payouts, wager]);

            const newPlayerHands = [...playerHands, []];
            const splitCard = newPlayerHands[currentHand][1];

            newPlayerHands[currentHand] = [newPlayerHands[currentHand][0]];
            newPlayerHands[newPlayerHands.length - 1] = [splitCard];
            setPlayerHands(newPlayerHands);
        }
    }

    /**
     * Button functionality for resetting the game
     */
    const reset = () => {
        setShowHands(false);

        setHandOver([false]);
        setGameOver(false);
        setGameState([]);

        setCurrentHand(0);
        setDealerAction(false);
        setDealerHand([]);
        setPlayerHands([[]]);
    }
    
    return (
        <>
            <p className="chip-counter">{chipCount}</p>
                <div className="count-badge" onClick={() => setShowCount(!showCount)}>
                    {showCount ? count : "Count"}
                </div>
            
            <div className="game-page">
                <div className={`game-setup ${showHands ? "inactive" : "active"}`}>
                    <h2>Place Your Bet:</h2>
                    <form onSubmit={setup}>
                        <input
                        type="number"
                        value={wager}
                        onChange={(e) => setWager(e.target.value)}
                        required
                        min="10"
                        max={Math.min(chipCount, 200)}
                        />
                        <button type="submit">Deal</button>
                    </form>
                </div>

                <div className={`game-elements ${showHands ? "active" : "inactive"}`}>
                    <Hand hand={dealerHand} isDealer hideDealerCard={!gameOver}/>
                    <PlayerHands hands={playerHands} current={currentHand} state={gameState} show={showHands}/>
                    <div className="game-actions">
                        <button onClick={handleHit}>Hit</button>
                        <button onClick={handleStand}>Stand</button>
                        <button onClick={handleDoubleDown}>Double Down</button>
                        <button onClick={handleSplit}>Split</button>
                    </div>
                    {gameOver && <button className="reset" onClick={reset}>Reset</button>}
                </div>
            </div>
        </>
    );
}