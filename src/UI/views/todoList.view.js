
import {todoListSliceKey} from "../../core/todoList/todo.state.js";
import {stateSelector} from "../../core/selector.js";
import { ngFor, ngIf} from "../utils.js";
import {errorComponent, todoComponent} from "../components/todoList.components.js";
import {headerComponent} from "../components/common.components.js"


const addTodoListener = (domApi, useCase) => {
    const addBtn = domApi.querySelector("#addTodoBtn");
    const doneBtns = domApi.querySelectorAll("[data-action='done']");
    const deleteBtns = domApi.querySelectorAll("[data-action='delete']");
    const addInput = domApi.querySelector("#addTodoInput");
    addBtn.addEventListener("click", () => {
        useCase.addTodo(addInput.value);
    })
    doneBtns.forEach(button => button.addEventListener("click", (event) => {
        const todoId = event.target.dataset.id;
        useCase.doneTodo(todoId);
    }))
    deleteBtns.forEach(button => button.addEventListener("click", (event) => {
        const todoId = event.target.dataset.id;
        useCase.deleteTodo(todoId);
    }))
}
export const todoListView = (store, domApi, useCase) => {
    console.log("todo ")
    const model = stateSelector(store, todoListSliceKey);
    const root = domApi.querySelector("#app");
    root.innerHTML = todoListComponentRender(model);
    addTodoListener(domApi, useCase);
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
