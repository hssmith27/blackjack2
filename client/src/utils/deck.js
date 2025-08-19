const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits = ["D", "H", "C", "S"];

/**
 * Creates a deck where each card is a string of the form "RankSuit"
 * @returns An array of 52 cards represented as strings
 */
function createDeck() {
    const deck = [];
    for (const rank of ranks) {
        for (const suit of suits) {
            deck.push(rank + suit);
        }
    }
    return deck;
}

/**
 * Generates a shoe consisting of @num_decks decks
 * @param {number} num_decks the number of decks in the shoe
 * @returns an array with @num_decks decks
 */
export function createShoe(num_decks) {
    const deck = createDeck();
    const shoe = [];

    for (let i = 0; i < num_decks; i++) {
        shoe.push(...deck);
    }

    return shoe;
}

/**
 * Shuffles an array @shoe
 * @param {string[]} shoe the array to be shuffled
 * @returns a shuffled @shoe
 */
export function shuffle(shoe) {
    const shuffledShoe = [...shoe];

    for (let i = shuffledShoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledShoe[i], shuffledShoe[j]] = [shuffledShoe[j], shuffledShoe[i]];
    }

    return shuffledShoe;
}

/**
 * Calculates a given hands value, accounting for Aces
 * @param {string[]} hand the hand whose value is counted
 * @returns the total value of the hand
 */
export function calculateHandValue(hand) {
    let total = 0;
    let aceCount = 0;

    for (const card of hand) {
        const rank = card.slice(0, -1);
        if (rank === "A") {
            aceCount++;
            total += 11;
        }
        else if (rank == "J" || rank == "Q" || rank == "K") {
            total += 10;
        }
        else {
            total += parseInt(rank);
        }
    }

    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount -= 1;
    }

    return total;
}

/**
 * Checks if a given hand has a value greater than 21
 * @param {string[]} hand the hand that's checked
 * @returns whether the hand's value is greater than 21
 */
export function isBust(hand) {
    return calculateHandValue(hand) > 21;
}

/**
 * Checks if a given hand is a blackjack
 * @param {string[]} hand the hand that's checked
 * @returns whether the hand is a blackjack
 */
export function isBlackjack(hand) {
    return calculateHandValue(hand) === 21 && hand.length === 2;
}

/**
 * Checks if the cards of a given hand can be split
 * @param {string[]} hand the hand that's checked
 * @returns whether the cards of a given hand can be split
 */
export function canSplit(hand) {
    const tenValued = ["10", "J", "Q", "K"];

    if (hand.length === 2) {
        const rank1 = hand[0].slice(0, -1);
        const rank2 = hand[1].slice(0, -1);

        if (rank1 === rank2) {
            return true;
        }
        if (tenValued.includes(rank1) && tenValued.includes(rank2)) {
            return true;
        }
    }

    return false;
}