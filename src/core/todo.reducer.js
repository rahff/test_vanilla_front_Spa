export const addTodo = (state, event) => {
    return {
        ...state,
        todos: [
            ...state.todos,
            event.payload
        ]
    }
}

export const removeTodo = (state, event) => {
    return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== event.payload)
    }
}

export const doneTodo = (state, event) => {
    return {
        ...state,
        todos: state.todos.map(todo => {
            if(todo.id === event.payload){
                todo = {...todo, done: true}
            }
            return todo;
        })
    }
}