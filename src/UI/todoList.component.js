import {addTodoInList} from "../core/todo.use-cases.js";


const todoListSelector = (store) => store.getState().todoListSlice

const todoListComponent =  (selector) => {
    return `
    <div>
        <ul>
            ${selector.todos.map(todo => "<li>"+todo.description+"</li>").join("")}
        </ul>
        <input type="text"> // how I bind event & how I link useCases on event handler ?
        <button>Add</button>
    </div>
    
    `
}

export const page = (rootElement, store) => {
    rootElement.innerHTML = todoListComponent(todoListSelector(store))
}