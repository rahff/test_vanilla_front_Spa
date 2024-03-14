export const setCards = (state, event) => {
    return {
        ...state,
        cards: event.payload,
        isLoading: false
    }
}