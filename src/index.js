import {page} from "./UI/todoList.component.js";
import {store} from "./core/store.js";

const root = document.querySelector("main")


page(root, store)