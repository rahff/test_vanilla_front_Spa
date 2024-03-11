import {combineReducers, configureStore} from "@reduxjs/toolkit"
import {todoListSlice} from "./todo.state.js";


const rootReducer = combineReducers({
    [todoListSlice.name]: todoListSlice.reducer
})

export const testingStore = () => configureStore({
    reducer: rootReducer
});
export const store = configureStore({
    reducer: rootReducer
});