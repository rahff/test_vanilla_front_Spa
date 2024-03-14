
import {todoListSliceKey} from "../../core/todoList/todo.state.js";
import {stateSelector} from "../../core/selector.js";
import { ngFor, ngIf} from "../utils.js";
import {errorComponent, todoComponent} from "../components/todoList.components.js";
import {headerComponent} from "../components/common.components.js"

export class TodoListView {
    #model = (store) => stateSelector(store, todoListSliceKey);
    #store;
    #root;
    #useCases;
    #addBtn;
    #doneBtns;
    #deleteBtns;
    #addInput;
    #domApi;
    #unsubscribe

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
        this.#root.innerHTML = todoListComponentRender(this.getModel());
    }

    init() {
        this.#unsubscribe = this.#store.subscribe(this.#refresh.bind(this));
        this.#refresh();
    }

    #addListeners(){
        this.#addBtn = this.#domApi.querySelector("#addTodoBtn");
        this.#doneBtns = this.#domApi.querySelectorAll("[data-action='done']");
        this.#deleteBtns = this.#domApi.querySelectorAll("[data-action='delete']");
        this.#addInput = this.#domApi.querySelector("#addTodoInput");
        this.#addBtn.addEventListener("click", () => {
            this.addTodo(this.#addInput.value);
        })
        this.#doneBtns.forEach(button => button.addEventListener("click", (event) => {
            const todoId = event.target.dataset.id;
            this.doneTodo(todoId);
        }))
        this.#deleteBtns.forEach(button => button.addEventListener("click", (event) => {
            const todoId = event.target.dataset.id;
            this.deleteTodo(todoId);
        }))
    }

    addTodo(value){
        this.#useCases.addTodo(value);
    }

    doneTodo(value){
        this.#useCases.doneTodo(value);
    }

    deleteTodo(value){
        this.#useCases.deleteTodo(value);
    }

    #refresh(){
        this.#render();
        this.#addListeners();
    }

    destroy(){
        this.#unsubscribe();
    }
}


export const todoListComponentRender = (todoModel, headerModel) => {
    return `
    ${headerComponent(headerModel)}
    <div>
        <ul>
            ${ngFor(todoModel.todos, todoComponent)}
        </ul>
        <input id="addTodoInput" type="text">
        ${ngIf(todoModel.error, errorComponent(todoModel.error))}
        <button id="addTodoBtn">Add</button>
    </div>
    `
}
