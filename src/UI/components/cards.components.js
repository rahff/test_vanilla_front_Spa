
export const cardComponent = (card) => `
    <div>
        <h3>${card.title}</h3>
        <img alt="${card.img.alt}" height="200" width="200" src="${card.img.url}">
        <p>${card.description}</p>
    </div>
`