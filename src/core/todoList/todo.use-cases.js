import {todoAddedEvent, todoAlreadyExistEvent, todoDoneEvent, todoRemovedEvent} from "./todo.events.js";
import {todoListSliceKey} from "./todo.state.js";
export const makeTodo = (idProvider) => (description) => ({description, done: false, id: idProvider()})

const getTodos = (store) => store.getState()[todoListSliceKey].todos
export const addTodoInList = (store, todoFactory) => value => {
    const alreadyExist = getTodos(store).some(todo => todo.description === value);
    if(alreadyExist) store.dispatch(todoAlreadyExistEvent("todo already exists"));
    else store.dispatch(todoAddedEvent(todoFactory(value)));
}

export const removeTodoInList = store => todoId => {
    store.dispatch(todoRemovedEvent(todoId))
}

export const doneTodoInList = store => todoId => {
    store.dispatch(todoDoneEvent(todoId))
}