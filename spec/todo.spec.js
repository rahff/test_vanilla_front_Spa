import {testingStore} from "../src/core/store.js";
import {addTodoInList, doneTodoInList, makeTodo, removeTodoInList} from "../src/core/todoList/todo.use-cases.js";
import {selectorFactory} from "../src/core/selector.js";
import {todoListSliceKey} from "../src/core/todoList/todo.state.js";
import {fakeIdProvider} from "../src/adapters/adapters.js";


describe("The todoList", () => {
    let store;
    let addingTodo;
    let removingTodo;
    let finishTodo;
    let selector
    const theTodo = {description: "test something", done: false, id: "2"};
    
    beforeEach(() => {
        store = testingStore();
        addingTodo = addTodoInList(store, makeTodo(fakeIdProvider))
        removingTodo = removeTodoInList(store)
        finishTodo = doneTodoInList(store);
        selector = (store) => selectorFactory(store, todoListSliceKey);
    })
    it("should add todo in todoList", () => {
        addingTodo("test something");
        expect(selector(store).todos).toContain(theTodo)
    })

    it("cannot add todo that already exist with same description", () => {
        addingTodo("test something");
        addingTodo("test something");
        expect(selector(store).error).toEqual("todo already exists");
        expect(selector(store).todos[2]).toBeUndefined();
    })

    it("should remove todo in todoList", () => {
        addingTodo("do something");
        removingTodo("1");
        expect(selector(store).todos).not.toContain(theTodo)
    })

    it("should done todo in todoList", () => {
        addingTodo("do something");
        finishTodo("1");
        expect(selector(store).todos[0].done).toBeTrue()
    })
})