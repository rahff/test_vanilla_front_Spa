import {headerComponent, cardComponent} from "./components.js";
import {ngFor, ngIfElse} from "./utils.js";
import {stateSelector} from "../core/selector.js";
import {cardListSliceKey} from "../core/cards/cards.state.js";


export class CardListView {
    #domApi;
    #store;
    #useCases;
    #model = (store) => stateSelector(store, cardListSliceKey);
    #root;
    #unsubscribe;
    constructor(store, useCases, domApi) {
        this.#domApi = domApi;
        this.#store = store;
        this.#useCases = useCases;
    }

    getModel() {
        return this.#model(this.#store); // for testing purposes :/
    }
    getRootElement() {
        return this.#root;  // for testing purposes :/
    }
    #render(){
        this.#root = this.#domApi.querySelector("#app");
        this.#root.innerHTML = cardListComponentRender(this.getModel());
    }

    init() {
        this.#unsubscribe = this.#store.subscribe(this.#refresh.bind(this));
        this.#refresh();
        this.#useCases.query();
    }

    #refresh(){
        console.log("model", this.getModel())
        this.#render();
        this.#addListeners();
    }
    #addListeners(){}

    destroy(){
        this.#unsubscribe();
    }
}


const cardList = (cards) => `
    <div>
        <ul>
            ${ngFor(cards, cardComponent)}
        </ul>
    </div>`

const loader = () => `<p>...Loading</p>`
export const cardListComponentRender = (cardsModel, headerModel) => {
    return `
    ${headerComponent(headerModel)}
    ${ngIfElse(cardsModel.isLoading, loader(), cardList(cardsModel.cards))}
    `
}
