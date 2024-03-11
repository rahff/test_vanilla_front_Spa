import {createAction} from "@reduxjs/toolkit";

export const todoAddedEvent = createAction("todoListSlice/addTodo")
export const todoRemovedEvent = createAction("todoListSlice/removeTodo")
export const todoDoneEvent = createAction("todoListSlice/doneTodo")