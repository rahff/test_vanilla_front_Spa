import {ngIf} from "../utils.js";

export const errorComponent = (message) => `<span>${message}</span>`;
const todoButtons = (todo) => `
    <button data-action="done" ${ngIf(todo.done, "disabled")} data-id="${todo.id}">Done</button>
    <button data-action="delete" data-id="${todo.id}">Delete</button>
`
export const todoComponent = (todo) => `<li>${todo.description} ${todoButtons(todo)}</li>`;

