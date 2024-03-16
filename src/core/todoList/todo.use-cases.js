import {
    todoAddedEvent,
    todoAlreadyExistEvent,
    todoDoneEvent,
    todoReceivedEvent,
    todoRemovedEvent
} from "./todo.events.js";
import {todoListSliceKey} from "./todo.state.js";
import {stateSelector} from "../selector.js";


export const makeTodo = (idProvider) => (description) => ({description, done: false, id: idProvider()})

const getTodos = (store) => stateSelector(store, todoListSliceKey).todos;

const initialRequest = (store) => stateSelector(store, todoListSliceKey).init;

export const todoListQuery = (store, fetchTodo) => {
    return () => {
        if(!initialRequest(store)){
            fetchTodo().then(todos => {
                store.dispatch(todoReceivedEvent(todos));
            });
        }
    }
}
export const addTodoInList = (store, todoFactory) => (value, isValid) => {
    if(!isValid) return;
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