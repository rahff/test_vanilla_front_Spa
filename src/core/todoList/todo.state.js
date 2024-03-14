import {createSlice} from "@reduxjs/toolkit";
import {addTodo, doneTodo, removeTodo, setError, setTodos} from "./todo.reducer.js";



export const todoListSliceKey = "todoListSlice";
export const todoListSlice = createSlice({
    name: todoListSliceKey,
    initialState: {
        todos: [],
        error: null,
        isLoading: true,
        init: false
    },
    reducers: {
        addTodo,
        removeTodo,
        doneTodo,
        setError,
        setTodos
    }
})