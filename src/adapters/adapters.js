import {cardsData} from "../data/cards.data.js";

export const idProvider = () => Math.random().toString(36).substring(7).split("").join(".");
export const fakeIdProvider =  () => "2";

export const fetchCard = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve(cardsData), 200);
    })
};