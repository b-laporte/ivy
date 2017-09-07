import { VdRenderer } from "../../iv";
import { htmlRenderer } from "../../htmlrenderer";

interface Todo {
  title: string;
  completed: boolean;
  editing?: boolean;
}

enum Filter {
  ALL,
  ACTIVE,
  COMPLETED
}

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

let renderer;
let _todos: Todo[] = [];
if (window.localStorage) {
  const stored = window.localStorage.getItem('todos-iv');
  if (stored) {
    _todos = JSON.parse(stored);
  }
}
let _filter: Filter = Filter.ALL;
setFilter();
render();

window.addEventListener("hashchange", handleHashChange, false);
function handleHashChange() {
  setFilter();
  refresh();
}

function render() {
  if (!renderer) {
    renderer = htmlRenderer(document.getElementById("root"), todomvc);
  }
  refresh();
}

function refresh() {
  if (window.localStorage) {
    window.localStorage.setItem('todos-iv', JSON.stringify(_todos.map((todo) => {return {title: todo.title, completed: todo.completed};})));
  }
  renderer.refresh({todos: _todos, filter: _filter});
}

function setFilter() {
  const hash = window.location.hash;
  if (hash === '#/completed') {
    _filter = Filter.COMPLETED;
  } else if (hash === '#/active') {
    _filter = Filter.ACTIVE;
  } else {
    _filter = Filter.ALL;
  }
}

function todomvc(r: VdRenderer, todos: Todo[], filter: Filter) {
  `---
  <section a:class="todoapp">
    <header a:class="header">
      <h1>todos</h1>
      <input a:class="new-todo" placeholder="What needs to be done?" autofocus="true" onkeyup(e)=addTodo(e) />
    </header>
    % if (todos.length > 0) {
      % const itemsLeft = todos.filter((todo) => !todo.completed).length;
      <section a:class="main">
        <input id="toggle-all" a:class="toggle-all" type="checkbox" [checked]=itemsLeft===0/>
        <label for="toggle-all" onclick()=markAll()>Mark all as complete</label>
        <ul a:class="todo-list">
          % todos.filter((todo) => (filter == Filter.ALL || (filter == Filter.COMPLETED && todo.completed) || (filter == Filter.ACTIVE && !todo.completed))).forEach((todo) => {
            <li [a:class]=((todo.editing?'editing ':'')+(todo.completed?'completed':''))>
              <div a:class="view">
                <input a:class="toggle" type="checkbox" [checked]=todo.completed onclick()=toggleTodo(todo) />
                <label ondblclick(e)=startEditing(e, todo)>{{todo.title}}</label>
                <button a:class="destroy" onclick()=deleteTodo(todo)></button>
              </div>
              <input a:class="edit" [value]=todo.title onkeyup(e)=editTodo(e, todo) onblur(e)=stopEditing(e, todo)/>
            </li>
          % });
        </ul>
      </section>
      <footer a:class="footer">
        <span a:class="todo-count"><strong>{{itemsLeft}}</strong> item{{itemsLeft > 1?'s':''}} left</span>
        <ul a:class="filters">
          <li>
            <a [a:class]=(filter===Filter.ALL?'selected':'') href="#/">All</a>
          </li>
          <li>
            <a [a:class]=(filter===Filter.ACTIVE?'selected':'') href="#/active">Active</a>
          </li>
          <li>
            <a [a:class]=(filter===Filter.COMPLETED?'selected':'') href="#/completed">Completed</a>
          </li>
        </ul>
        % if (todos.length > itemsLeft) {
          <button a:class="clear-completed" onclick()=clearCompleted()>Clear completed</button>
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

function deleteTodo(todo: Todo) {
  const index = _todos.indexOf(todo);
  _todos.splice(index, 1);
  refresh();
}

function addTodo(event: any) {
  if (event.keyCode == ENTER_KEY) {
    if (event.target.value.length > 0) {
      _todos.push({title: event.target.value.trim(), completed: false});
      event.target.value = '';
      refresh();
    }
  }
}

function toggleTodo(todo: Todo) {
  todo.completed = !todo.completed;
  refresh();
}

function startEditing(event, todo: Todo) {
  todo.editing = true;
  setTimeout(() => {
    event.target.parentElement.parentElement.children[1].focus();
  }, 0);
  refresh();
}

function editTodo(event, todo: Todo) {
  if (event.keyCode == ENTER_KEY) {
    if (event.target.value.length > 0) {
      todo.title = event.target.value.trim();
      todo.editing = false;
      refresh();
    } else {
      deleteTodo(todo);
    }
  } else if (event.keyCode == ESCAPE_KEY) {
    stopEditing(event, todo);
  }
}

function stopEditing(event, todo) {
  todo.editing = false;
  event.target.value = todo.title;
  refresh();
}

function clearCompleted() {
  _todos = _todos.filter((todo) => !todo.completed);
  refresh();
}

function markAll() {
  const toBeCompleted = _todos.filter((todo) => !todo.completed).length > 0;
  _todos.forEach((todo) => {todo.completed = toBeCompleted});
  refresh();
}