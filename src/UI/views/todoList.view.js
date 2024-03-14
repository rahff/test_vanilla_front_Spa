
import {todoListSliceKey} from "../../core/todoList/todo.state.js";
import {stateSelector} from "../../core/selector.js";
import {ngFor, ngIf, ngIfElse} from "../utils.js";
import {errorComponent, todoComponent, todoListComponent} from "../components/todoList.components.js";
import {headerComponent, loader} from "../components/common.components.js"

const addTodoListeners = (domApi, command) => {
    const addBtn = domApi.querySelector("#addTodoBtn");
    if(!addBtn) return;
    const addInput = domApi.querySelector("#addTodoInput");
    addBtn.addEventListener("click", () => {
        command(addInput.value);
    })
}

const doneTodoListeners = (domApi, command) => {
    const doneBtns = domApi.querySelectorAll("[data-action='done']");
    if(!doneBtns) return;
    doneBtns.forEach(button => button.addEventListener("click", (event) => {
        const todoId = event.target.dataset.id;
        command(todoId);
    }))
}

const deleteTodoListeners = (domApi, command) => {
    const deleteBtns = domApi.querySelectorAll("[data-action='delete']");
    if(!deleteBtns) return;
    deleteBtns.forEach(button => button.addEventListener("click", (event) => {
        const todoId = event.target.dataset.id;
        command(todoId);
    }))
}
export const addTodoListListener = (domApi, useCase) => {
    addTodoListeners(domApi, useCase.addTodo);
    doneTodoListeners(domApi, useCase.doneTodo);
    deleteTodoListeners(domApi, useCase.deleteTodo);

}
export const todoListView = (store, domApi, useCase) => {
    const model = stateSelector(store, todoListSliceKey);
    const root = domApi.querySelector("#app");
    root.innerHTML = todoListComponentRender(model);
    console.log("model ", model)
    addTodoListListener(domApi, useCase);
}

export const todoListComponentRender = (todoModel) => {
    return `
    ${headerComponent()}
    ${ngIfElse(todoModel.isLoading, loader(), todoListComponent(todoModel))}
    `
}
