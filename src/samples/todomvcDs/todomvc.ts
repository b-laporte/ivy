import { htmlRenderer } from "../../htmlrenderer";
import { TodoApp, TodoAppData, TodoData } from "../../test/dstore/tododata";
import { watch, DataList, processingDone } from "../../dstore/dstore";

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

let todoApp = TodoApp.create(), renderer;

window.addEventListener("hashchange", handleHashChange, false);
function handleHashChange() {
  const hash = window.location.hash;
  if (hash === '#/completed') {
    todoApp.filter = "COMPLETED";
  } else if (hash === '#/active') {
    todoApp.filter = "ACTIVE";
  } else {
    todoApp.filter = "ALL";
  }
}

// processors
let counter=0;
TodoApp.setProcessor("/itemsLeft", function (list: DataList<TodoData>) {
  let itemsLeft = 0;
  list.forEach(item => {
    itemsLeft += item.complete ? 0 : 1;
  });
  return itemsLeft;
});

TodoApp.setProcessor("/listView", function (filter: string, list: DataList<TodoData>) {
  if (filter === "ALL") {
    return list;
  } else {
    let isComplete = (filter === "COMPLETED");
    return list.filter(item => item.complete === isComplete);
  }
});

function render(app) {
  todoApp = app || todoApp;
  if (!renderer) {
    renderer = htmlRenderer(document.getElementById("root"), todoMvc);
  }
  renderer.refresh({ todoApp: todoApp });
}

watch(todoApp, render);

function todoMvc(todoApp: TodoAppData) {
  `---
  % let todos = todoApp.list;
  //% console.log("new Entry: '"+todoApp.newEntry+"'");
  <section a:class="todoapp">
    <header a:class="header">
      <h1>todos</h1>
      <input type="text" a:class="new-todo" placeholder="What needs to be done?" autofocus="true" [text]=todoApp.newEntry onkeyup(e)=addTodoOnEnter(e,todoApp) />
    </header>
    % if (todos.length) {
       <section a:class="main">
        <input id="toggle-all" a:class="toggle-all" type="checkbox" [checked]=todoApp.itemsLeft===0/>
        <label for="toggle-all" onclick()=markAll(todoApp)>Mark all as complete</label>
        <ul a:class="todo-list">
          % for (let i=0;todoApp.listView!.length>i;i++) {
            % let todo=todoApp.listView.get(i);
            <li [a:class]=((todo.editing?'editing ':'')+(todo.complete?'completed':''))>
              <div a:class="view">
                <input a:class="toggle" type="checkbox" [checked]=todo.complete onclick()=toggleTodo(todo) />
                <label ondblclick(e)=startEditing(e, todoApp, todo)>{{todo.description}}</label>
                <button a:class="destroy" onclick()=deleteTodo(todoApp, todo)></button>
              </div>
              <input a:class="edit" [value]=todo.description onkeyup(e)=editTodo(e, todoApp, todo) onblur(e)=stopEditing(e, todo)/>
            </li>
          % };
        </ul>
       </section>
      <footer a:class="footer">
        <span a:class="todo-count"><strong>{{todoApp.itemsLeft}}</strong> item{{todoApp.itemsLeft > 1?'s':''}} left</span>
        <ul a:class="filters">
          <li>
            <a [a:class]=(todoApp.filter==="ALL"?'selected':'') href="#/">All</a>
          </li>
          <li>
            <a [a:class]=(todoApp.filter==="ACTIVE"?'selected':'') href="#/active">Active</a>
          </li>
          <li>
            <a [a:class]=(todoApp.filter==="COMPLETED"?'selected':'') href="#/completed">Completed</a>
          </li>
        </ul>
        % if (todos.length > todoApp.itemsLeft) {
          <button a:class="clear-completed" onclick()=clearCompleted(todoApp)>Clear completed</button>
        % }
      </footer>
    % }
  </section>
  <footer a:class="info">
    <p>Double-click to edit a todo</p>
    <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
    <p>Created with <a href="https://github.com/b-laporte/iv/">IV</a></p>
    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
  </footer>
  ---`
}

// actions
function addTodoOnEnter(event: any, app: TodoAppData) {
  if (event.keyCode == ENTER_KEY) {
    app.newEntry = event.target.value; // iv doesn't support 2-way binding
    event.target.value = "";
    createNewTodo(app);
  }
}

function createNewTodo(app: TodoAppData) {
  let todoDesc = app.newEntry.trim();
  if (todoDesc.length) {
    let item = app.list.newItem();
    item.description = todoDesc;
    app.newEntry = "";
  }
}

function toggleTodo(todo: TodoData) {
  todo.complete = !todo.complete;
}

function deleteTodo(app: TodoAppData, todo: TodoData) {
  const index = app.list.indexOf(todo);
  app.list.splice(index, 1);
}

function clearCompleted(app: TodoAppData) {
  let newList = app.list.filter((todo) => !todo.complete)
  app.list = newList;
}

function editTodo(event, app: TodoAppData, todo: TodoData) {
  if (event.keyCode == ENTER_KEY) {
    if (event.target.value.length) {
      todo.description = event.target.value.trim();
      todo.editing = false;
    } else {
      deleteTodo(app, todo);
    }
  } else if (event.keyCode == ESCAPE_KEY) {
    stopEditing(event, todo);
  }
}

async function startEditing(event, app: TodoAppData, todo: TodoData | null) {
  // called when an item is clicked
  app.list.forEach((item) => {
    item.editing = (item === todo);
  });
  app = await processingDone(app); // will call all processors and watchers (including template refresh)
  // focus element here
  event.target.parentElement.parentElement.children[1].focus();
};

function cancelEditing(event, todo: TodoData) {
  todo.editing = false;
  event.target.value = todo.description;
}

function stopEditing(event, todo: TodoData) {
  todo.editing = false;
  event.target.value = todo.description;
}

function markAll(app: TodoAppData) {
  const toBeCompleted = app.list.filter((todo) => !todo.complete).length > 0;
  app.list.forEach((todo) => { todo.complete = toBeCompleted });
}
