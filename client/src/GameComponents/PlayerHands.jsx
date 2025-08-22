import Hand from './Hand.jsx';

export default function PlayerHands({ hands, current, state }) {
    return <div className="player-hands">
        {hands.map((hand, index) => (
            <Hand 
            key={index} 
            hand={hand} 
            isDealer={false} 
            hideDealerCard={false} 
            isCurrent={index === current} 
            message={state[index]}
            />
        ))}
    </div>
}