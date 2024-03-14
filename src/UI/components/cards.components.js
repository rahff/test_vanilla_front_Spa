import {ngFor} from "../utils.js";

export const cardComponent = (card) => `
    <div>
        <h3>${card.title}</h3>
        <img alt="${card.img.alt}" height="200" width="200" src="${card.img.url}">
        <p>${card.description}</p>
    </div>
`

export const cardList = (cards) => `
    <div>
        <ul>
            ${ngFor(cards, cardComponent)}
        </ul>
    </div>`

export const loader = () => `<p>...Loading</p>`