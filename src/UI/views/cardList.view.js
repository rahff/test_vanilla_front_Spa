import {cardList, loader} from "../components/cards.components.js"
import {ngIfElse} from "../utils.js";
import {stateSelector} from "../../core/selector.js";
import {cardListSliceKey} from "../../core/cards/cards.state.js";
import {headerComponent} from "../components/common.components.js";



export const cardListView = (store, domApi) => {
    const model = stateSelector(store, cardListSliceKey);
    const root = domApi.querySelector("#app");
    root.innerHTML = cardListComponentRender(model);
}




export const cardListComponentRender = (cardsModel, headerModel) => {
    return `
    ${headerComponent(headerModel)}
    <div id="cardList">
    ${ngIfElse(cardsModel.isLoading, loader(), cardList(cardsModel.cards))}
    </div>
    
    `
}
