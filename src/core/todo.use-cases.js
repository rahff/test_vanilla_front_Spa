import {todoAddedEvent, todoDoneEvent, todoRemovedEvent} from "./todo.events.js";


export const addTodoInList = store => todo => {
    store.dispatch(todoAddedEvent(todo))
}

export const removeTodoInList = store => todoId => {
    store.dispatch(todoRemovedEvent(todoId))
}

export const doneTodoInList = store => todoId => {
    store.dispatch(todoDoneEvent(todoId))
}