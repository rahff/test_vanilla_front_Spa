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
    #routes;

    constructor(routes) {
        this.#routes = routes;
    }
    static getInstance(routes){
        if(Router.#INSTANCE === null){
            Router.#INSTANCE = new Router(routes);
        }
        return Router.#INSTANCE;
    }

    #init(){
        const route = this.#routes.find(route => route.path === this.#state)
        if(!route) throw new Error("unknown path");
        if(this.#storeUnsubscribe) this.#storeUnsubscribe();
        this.#storeUnsubscribe = initView(route, store);
    }

    navigate(path){
        this.#state = path;
        this.#init();
    }
}

const initView = (route, store) => {
    const unsubscribe =  store.subscribe(route.view);
    queryView(route.providers.query, route.view);
    return unsubscribe;
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
