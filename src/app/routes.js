import {
    addTodoInList,
    doneTodoInList,
    makeTodo,
    removeTodoInList,
    todoListQuery
} from "../core/todoList/todo.use-cases.js";
import {store} from "../core/store.js";
import {fetchCard, fetchTodos, idProvider} from "../adapters/adapters.js";
import {queryCards} from "../core/cards/cards.use-cases.js";
import {todoListView} from "./views/todoList.view.js";
import {cardListView} from "./views/cardList.view.js";

export const routes = [
    {
        path: "/", view: () => todoListView(store, document, {
            addTodo: addTodoInList(store, makeTodo(idProvider)),
            deleteTodo: removeTodoInList(store),
            doneTodo: doneTodoInList(store)
        }),
        providers: {
            query: todoListQuery(store, fetchTodos),
        }
    },
    {
        path: "/cards", view: () => cardListView(store, document),
        providers: {
            query: queryCards(store, fetchCard)
        }
    }
]




