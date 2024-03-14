import {createAction} from "@reduxjs/toolkit";

const payload = (payload) => ({payload})
export const cardsReceivedEvent = createAction("cardListSlice/setCards", payload)