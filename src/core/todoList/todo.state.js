import {createSlice} from "@reduxjs/toolkit";
import {addTodo, doneTodo, removeTodo, setError} from "./todo.reducer.js";



export const todoListSliceKey = "todoListSlice";
export const todoListSlice = createSlice({
    name: todoListSliceKey,
    initialState: {
        todos: [
            {
                description: "do something", done: false, id: "1"
            }
        ],
        error: null
    },
    reducers: {
        addTodo,
        removeTodo,
        doneTodo,
        setError
    }
})