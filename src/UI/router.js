import {addTodoInList, doneTodoInList, makeTodo, removeTodoInList} from "../core/todoList/todo.use-cases.js";
import {store} from "../core/store.js";
import {todoListView} from "./views/todoList.view.js";
import {fetchCard, idProvider} from "../adapters/adapters.js";
import {cardListView} from "./views/cardList.view.js";
import {queryCards} from "../core/cards/cards.use-cases.js";

const todoListProvider = {
    addTodo: addTodoInList(store, makeTodo(idProvider)),
    deleteTodo: removeTodoInList(store),
    doneTodo: doneTodoInList(store)
};

const cardListProvider = {
    query: queryCards(store, fetchCard)
}

export class Router {
    #state = "/";
    #storeUnsubscribe;
    static #INSTANCE = null;

    static getInstance(){
        if(Router.#INSTANCE === null){
            Router.#INSTANCE = new Router();
        }
        return Router.#INSTANCE;
    }

    #init(){
        switch (this.#state) {
            case "/":
                if(this.#storeUnsubscribe) this.#storeUnsubscribe();
                this.#storeUnsubscribe = store.subscribe(()=> todoListView(store, document, todoListProvider));
                todoListView(store, document, todoListProvider);
                break;
            case "/cards":
                if(this.#storeUnsubscribe) this.#storeUnsubscribe();
                this.#storeUnsubscribe = store.subscribe(()=> cardListView(store, document));
                cardListProvider.query();
                cardListView(store, document);
                break;
            default: throw new Error("unknown path");
        }
    }

    navigate(path){
        this.#state = path;
        this.#init();
    }
}


export class RouterLink extends HTMLElement {
    #router;
    #path;
    constructor() {
        super();
        this.#router = Router.getInstance();
        this.#path = this.getAttribute('data-path');
        this.addEventListener("click", this.#handleClick.bind(this));
    }

    #handleClick(){
        console.log("router-link")
        this.#router.navigate(this.#path);
    }
}
