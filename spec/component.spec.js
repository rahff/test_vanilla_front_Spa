import {todoListComponentRender, todoListView} from "../src/UI/views/todoList.view.js";
import {testingStore} from "../src/core/store.js";
import {addTodoInList, makeTodo, todoListQuery, doneTodoInList, removeTodoInList} from "../src/core/todoList/todo.use-cases.js";
import {fakeIdProvider, syncFetchTodos} from "../src/adapters/adapters.js";
import {stateSelector} from "../src/core/selector.js"
import {todoListSliceKey} from "../src/core/todoList/todo.state.js"



const noopElement = {
    addEventListener: () => {}
}
describe("Component testability", () => {
    let domApi;
    let store;
    let todoListCommands;
    let rootElement;
    let model;
    beforeEach(() => {
        store = testingStore();
        rootElement = {
            innerHTML: ""
        }
        todoListCommands = {
            addTodo: addTodoInList(store, makeTodo(fakeIdProvider)),
            doneTodo: doneTodoInList(store),
            deleteTodo: removeTodoInList(store),
            query: todoListQuery(store, syncFetchTodos)
        }
        domApi = {
            querySelectorAll: () => {},
            querySelector: (selector) => {
                if(selector === "#app")
                    return rootElement
                else return noopElement
            }
        }
        model = store => stateSelector(store, todoListSliceKey)
    });

    it("should works", () => {
        todoListView(store, domApi, todoListCommands);
        expect(rootElement.innerHTML).toEqual(todoListComponentRender(model(store)))
    })
})