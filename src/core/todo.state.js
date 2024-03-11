import {createSlice} from "@reduxjs/toolkit";
import {addTodo, doneTodo, removeTodo} from "./todo.reducer.js";

export const todoListSlice = createSlice({
    name: "todoListSlice",
    initialState: {
        todos: [
            {
                description: "do something", done: false, id: 1
            }
        ]
    },
    reducers: {
        addTodo,
        removeTodo,
        doneTodo
    }
})