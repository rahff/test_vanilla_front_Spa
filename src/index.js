import {todoListContainer, todoListSelector} from "./UI/todoList.component.js";
import {store} from "./core/store.js";
import {addTodoInList} from "./core/todo.use-cases.js";

const root = document.querySelector("main")
const refresh = () => {
    todoListContainer(root, todoListSelector(store));
    addPageListener(addTodoInList(store))
};

const makeTodo = (description) => ({description, done: false, id: 1})
const addPageListener = (addTodoUseCase) => {
    const addBtn = document.querySelector("#addTodoBtn");
    const addInput = document.querySelector("#addTodoInput");
    addBtn.addEventListener("click", () => {
        addTodoUseCase(makeTodo(addInput.value));
    })
}
store.subscribe(() => refresh())
todoListContainer(root, todoListSelector(store));
addPageListener(addTodoInList(store));
