import {testingStore} from "../src/core/store.js";
import {addTodoInList, doneTodoInList, removeTodoInList} from "../src/core/todo.use-cases.js";


describe("The todoList", () => {
    let store;
    let addingTodo;
    let removingTodo;
    let finishTodo;
    const theTodo = {description: "do something", done: false, id: 1};
    
    beforeEach(() => {
        store = testingStore();
        addingTodo = addTodoInList(store)
        removingTodo = removeTodoInList(store)
        finishTodo = doneTodoInList(store)
    })
    it("should add todo in todoList", () => {
        addingTodo(theTodo);
        expect(store.getState().todoListSlice.todos).toContain(theTodo)
    })

    it("should remove todo in todoList", () => {
        addingTodo(theTodo);
        removingTodo(1);
        expect(store.getState().todoListSlice.todos).not.toContain(theTodo)
    })

    it("should done todo in todoList", () => {
        addingTodo(theTodo);
        finishTodo(1);
        expect(store.getState().todoListSlice.todos[0].done).toBeTrue()
    })
})