import {store} from "../core/store.js";
import {queryView} from "./utils.js";



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

    navigate(path){
        this.#state = path;
        this.#init();
    }

    #init(){
        const route = this.#routes.find(route => route.path === this.#state)
        if(!route) throw new Error("unknown path");
        if(this.#storeUnsubscribe) this.#storeUnsubscribe();
        this.#storeUnsubscribe = initView(route, store);
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
