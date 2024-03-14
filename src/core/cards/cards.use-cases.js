import {cardsReceivedEvent} from "./cards.events.js";



export const queryCards = (store, fetchCard) => {
    return () => {
        fetchCard().then(cards => {
            store.dispatch(cardsReceivedEvent(cards))
        })

    }
}