import {ngIf} from "./utils.js";

export const errorComponent = (message) => `<span>${message}</span>`;
const todoButtons = (todo) => `
    <button data-action="done" ${ngIf(todo.done, "disabled")} data-id="${todo.id}">Done</button>
    <button data-action="delete" data-id="${todo.id}">Delete</button>
`
export const todoComponent = (todo) => `<li>${todo.description} ${todoButtons(todo)}</li>`;
export const cardComponent = (card) => `<div><h3>${card.title}</h3><img alt="${card.img.alt}" height="200" width="200" src="${card.img.url}"><p>${card.description}</p></div>`
export const headerComponent = (model) => `
    <header>
        <ul>
            <li><router-link data-path="/">Todo</router-link></li>
            <li><router-link data-path="/cards">Cards</router-link></li>
        </ul>
    </header>`