import {testingStore} from "../src/core/store.js";
import {addTodoInList, doneTodoInList, makeTodo, removeTodoInList} from "../src/core/todoList/todo.use-cases.js";
import {selectorFactory} from "../src/core/selector.js";
import {todoListSliceKey} from "../src/core/todoList/todo.state.js";
import {todoListComponentRender, TodoListView} from "../src/UI/views/todoList.view.js";
import {fakeIdProvider} from "../src/adapters/adapters.js";


const noopElement = {
    addEventListener: () => {}
}
const fakeDocument = {
    querySelector: (selector) => {
        if(selector === "#app") return {innerHTML: ""}
        return noopElement;
    }
};
describe("Component testability", () => {
    let component;
    let store;
    let useCases;
    let selector;

    beforeEach(() => {
        store = testingStore();
        useCases = {
            addTodo: addTodoInList(store, makeTodo(fakeIdProvider)),
            deleteTodo: removeTodoInList(store),
            doneTodo: doneTodoInList(store)
        };
        selector = (store) => selectorFactory(store, todoListSliceKey);
        component = new TodoListView(store, useCases, fakeDocument);
        component.init()
    })

    it("should display new todo", () => {
        component.addTodo("test something");
        expect(component.getModel().todos).toContain({description: "test something", done: false, id: "2"})
        expect(component.getRootElement().innerHTML).toEqual(todoListComponentRender(component.getModel()));
    });

    it("should remove todo", () => {
        component.deleteTodo("1");
        expect(component.getModel().todos).not.toContain({description: "do something", done: false, id: "1"})
        expect(component.getRootElement().innerHTML).toEqual(todoListComponentRender(component.getModel()));
    });

    it("should done todo", () => {
        component.doneTodo("1");
        expect(component.getModel().todos).toContain({description: "do something", done: true, id: "1"})
        expect(component.getRootElement().innerHTML).toEqual(todoListComponentRender(component.getModel()));
    });

    it("should display error message when something goes wrong", () => {
        component.addTodo("test something");
        component.addTodo("test something");
        expect(component.getModel().todos[2]).toBeUndefined();
        expect(component.getModel().error).toEqual("todo already exists");
        expect(component.getRootElement().innerHTML).toEqual(todoListComponentRender(component.getModel()));
    })

})

