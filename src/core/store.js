import {combineReducers, configureStore} from "@reduxjs/toolkit"
import {todoListSlice, todoListSliceKey} from "./todoList/todo.state.js";
import {cardListSlice, cardListSliceKey} from "./cards/cards.state.js";


const rootReducer = combineReducers({
    [todoListSliceKey]: todoListSlice.reducer,
    [cardListSliceKey]: cardListSlice.reducer
})

export const testingStore = () => configureStore({
    reducer: rootReducer
});
export const store = configureStore({
    reducer: rootReducer
});