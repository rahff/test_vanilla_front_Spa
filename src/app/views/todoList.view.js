
import {todoListSliceKey} from "../../core/todoList/todo.state.js";
import {stateSelector} from "../../core/selector.js";
import {ngIfElse} from "../utils.js";
import {errorComponent, todoListComponent} from "../components/todoList.components.js";
import {headerComponent, loader} from "../components/common.components.js"


const todoValidator = (value) => {
    if(!value.match(/^[a-zA-Z0-9]+$/)){
        return {
            message: "should be alphanumeric"
        }
    }
    return null
}

const addTodoListeners = (domApi, command) => {
    const addBtn = domApi.querySelector("#addTodoBtn");
    const formControl = domApi.querySelector("#addTodoInput");
    if(!addBtn || !formControl) return;
    formControl.addValidator({fn: todoValidator, templateError: errorComponent})
    addBtn.addEventListener("click", () => {
        command(formControl.value, formControl.isValid());
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
const addTodoListListener = (domApi, useCase) => {
    addTodoListeners(domApi, useCase.addTodo);
    doneTodoListeners(domApi, useCase.doneTodo);
    deleteTodoListeners(domApi, useCase.deleteTodo);

}
export const todoListView = (store, domApi, useCase) => {
    const model = stateSelector(store, todoListSliceKey);
    const root = domApi.querySelector("#app");
    root.innerHTML = todoListComponentRender(model);
    addTodoListListener(domApi, useCase);
}

export const todoListComponentRender = (todoModel) => {
    return `
    ${headerComponent()}
    ${ngIfElse(todoModel.isLoading, loader(), todoListComponent(todoModel))}
    `
}
