

export const setTodos = (state, event) => {
    return {
        ...state,
        todos: event.payload,
        isLoading: false,
        init: true
    }
}

export const addTodo = (state, event) => {
    return {
        ...state,
        todos: [
            ...state.todos,
            event.payload
        ],
        error: null
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

export const setError = (state, event) => {
    return {
        ...state,
        error: event.payload
    }
}
