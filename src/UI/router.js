import {addTodoInList, doneTodoInList, makeTodo, removeTodoInList} from "../core/todoList/todo.use-cases.js";
import {store} from "../core/store.js";
import {TodoListView} from "./todoList.view.js";
import {fetchCard, idProvider} from "../adapters/adapters.js";
import {CardListView} from "./cardList.view.js";
import {queryCards} from "../core/cards/cards.use-cases.js";

const todoListProvider = {
    addTodo: addTodoInList(store, makeTodo(idProvider)),
    deleteTodo: removeTodoInList(store),
    doneTodo: doneTodoInList(store)
};

const cardListProvider = {
    query: queryCards(store, fetchCard)
}
const todoListView = new TodoListView;

export class Router {
    #state = "/";
    #currentView;
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
                if(this.#currentView) this.#currentView.destroy();
                this.#currentView = new TodoListView(store, todoListProvider, document);
                this.#currentView.init();
                break;
            case "/cards":
                if(this.#currentView) this.#currentView.destroy();
                this.#currentView = new CardListView(store, cardListProvider, document);
                this.#currentView.init();
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

    #handleClick(event){
        event.preventDefault();
        this.#router.navigate(this.#path);
    }
}
