import {createAction} from "@reduxjs/toolkit";

const payload = (payload)=> ({payload})
export const todoReceivedEvent = createAction("todoListSlice/setTodos", payload)
export const todoAddedEvent = createAction("todoListSlice/addTodo", payload)
export const todoRemovedEvent = createAction("todoListSlice/removeTodo", payload)
export const todoDoneEvent = createAction("todoListSlice/doneTodo", payload)
export const todoAlreadyExistEvent = createAction("todoListSlice/setError", payload)