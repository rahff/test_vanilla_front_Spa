

export const todoListSelector = (store) => store.getState().todoListSlice

const todoListComponent = (selector) => {
    return `
    <div>
        <ul>
            ${selector.todos.map(todo => "<li>"+todo.description+"</li>").join("")}
        </ul>
        <input id="addTodoInput" type="text"> // how I bind event & how I link useCases on event handler ?
        <button id="addTodoBtn">Add</button>
    </div>
    `
}

export const todoListContainer = (rootElement, selector) => {
    rootElement.innerHTML = todoListComponent(selector)
}