import {
    addTodoInList,
    doneTodoInList,
    makeTodo,
    removeTodoInList,
    todoListQuery
} from "../core/todoList/todo.use-cases.js";
import {store} from "../core/store.js";
import {todoListView} from "./views/todoList.view.js";
import {fetchCard, fetchTodos, idProvider} from "../adapters/adapters.js";
import {cardListView} from "./views/cardList.view.js";
import {queryCards} from "../core/cards/cards.use-cases.js";
import {queryView} from "./utils.js";

const todoListProvider = {
    addTodo: addTodoInList(store, makeTodo(idProvider)),
    deleteTodo: removeTodoInList(store),
    doneTodo: doneTodoInList(store),
    query: todoListQuery(store, fetchTodos)
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
                const todoListRender = () => todoListView(store, document, todoListProvider);
                this.#storeUnsubscribe = store.subscribe(todoListRender);
                queryView(todoListProvider.query, todoListRender);
                break;
            case "/cards":
                if(this.#storeUnsubscribe) this.#storeUnsubscribe();
                const renderCardList = ()=> cardListView(store, document)
                this.#storeUnsubscribe = store.subscribe(renderCardList);
                queryView(cardListProvider.query, renderCardList);
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
    #path;
    constructor() {
        super();
        this.#path = this.getAttribute('data-path');
        this.addEventListener("click", this.#handleClick.bind(this));
    }

    #handleClick(){
        Router.getInstance().navigate(this.#path);
    }
}
