import '../styles/Hand.css'
import Card from './Card.jsx'

export default function Hand({ hand, isDealer, hideDealerCard }) {
    return <div className={`hand ${isDealer ? "dealer" : "player"}`}>
        {hand.map((text, idx) => (
            <Card card={text} hidden={idx === 1 && hideDealerCard}/>
        ))}
    </div>
}