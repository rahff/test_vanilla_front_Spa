import {createSlice} from "@reduxjs/toolkit";
import {setCards} from "./cards.reducer.js";


export const cardListSliceKey = "cardListSlice";
export const cardListSlice = createSlice({
    name: cardListSliceKey,
    initialState: {
        cards: [],
        isLoading: true
    },
    reducers: {
        setCards
    }
})