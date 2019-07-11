require('./index.html'); // webpack dependency
require('./base.css'); // webpack dependency
require('./index.css'); // webpack dependency

import * as ts from "./todo";
import { template, IvContent } from '../../iv';
import { changeComplete } from '../../trax/trax';

const ENTER_KEY = 13, ESCAPE_KEY = 27;

const todoApp = template(`(app) => {
    let todos = app.list;
    
    <section class="todoapp">
        <header class="header">
            <h1> # todos # </h1>
            <input type="text" class="new-todo" placeholder="What needs to be done?" autofocus="true" 
                autocomplete="off" text={app.newEntry} keyup(e)={addTodoOnEnter(e,app)} />
        </header>

        if (todos.length) {
            <section class="main">
                <input id="toggle-all" class="toggle-all" type="checkbox" [checked]={app.itemsLeft===0}/>
                <label for="toggle-all" click()={ts.toggleAllCompleted(app)}> # Mark all as complete # </label>
                <ul class="todo-list">
                    for (let i=0;app.listView!.length>i;i++) {
                        <*todoItem app={app} todo={app.listView[i]}/>
                    }
                </ul>
            </section>
            <footer class="footer">
                <span class="todo-count">
                    // note: (really) bad i18n practice...
                    <strong># {app.itemsLeft} #</strong> #item{app.itemsLeft > 1?'s':''} left # 
                </span>
                <ul class="filters">
                    <*filter app={app} filterCode="ALL"> # All # </>
                    <*filter app={app} filterCode="ACTIVE"> # Active # </>
                    <*filter app={app} filterCode="COMPLETED"> # Completed # </>
                </ul>
    
                if (todos.length > app.itemsLeft) {
                    <button class="clear-completed" click()={ts.clearCompleted(app)}> # Clear completed # </button>
                }
          </footer>
        }
    </section>

    <*infoFooter/>
}`);

const filter = template(`(app, filterCode:string, $content: IvContent) => {
    <li>
        <a class={app.filter===filterCode? 'selected':''} 
            href={"#/"+filterCode.toLowerCase()}
            click()={ts.setFilter(app,filterCode)}
            @content/>
    </li>
}`);

const todoItem = template(`(app, todo) => {
    <li class={"todo " + (todo.editing? 'editing ':'') + (todo.completed?'completed':'')}>
        <div class="view">
            <input class="toggle" type="checkbox" [checked]={todo.completed} click()={ts.toggleCompletion(todo)} />
            <label dblclick(e)={startEditing(e, app, todo)}> #{todo.description}# </label>
            <button class="destroy" click()={ts.deleteTodo(app, todo)}></button>
        </div>
        <input type="text" class="edit" value={todo.description} 
            keyup(e)={editTodo(e, app, todo)} 
            blur(e)={stopEditing(e, todo, true)}/>
    </li>
}`);

const infoFooter = template(`() => {
    <footer class="info">
        <p> # Double-click to edit a todo # </p>
        <p> # Template by # <a href="http://sindresorhus.com"> # Sindre Sorhus # </a></p>
        <p> # Created with # <a href="https://github.com/b-laporte/ivy"> # ivy # </a></p>
        <p> # Part of # <a href="http://todomvc.com"> # TodoMVC # </a></p>
  </footer>
}`);

function addTodoOnEnter(event: any, app: ts.TodoApp) {
    if (event.keyCode == ENTER_KEY) {
        app.newEntry = event.target.value; // ivy doesn't support 2-way binding
        event.target.value = "";
        ts.createTodo(app);
    }
}

function editTodo(event, app: ts.TodoApp, todo: ts.Todo) {
    if (event.keyCode === ENTER_KEY) {
        if (event.target.value.length) {
            todo.description = event.target.value.trim();
            todo.editing = false;
        } else {
            ts.deleteTodo(app, todo);
        }
    } else if (event.keyCode === ESCAPE_KEY) {
        stopEditing(event, todo, false);
    }
}

async function startEditing(event, app: ts.TodoApp, todo: ts.Todo | null) {
    // called when an item is clicked
    ts.startEditing(app, todo);
    await changeComplete(app); // wait for all refresh to complete
    // focus element here
    event.target.parentElement.parentElement.children[1].focus();
};

function stopEditing(event, todo: ts.Todo, validateCurrentInput) {
    if (validateCurrentInput) {
        todo.description = event.target.value.trim();
    }
    todo.editing = false;
    event.target.value = todo.description;
}

// --------------------------------------------------------------------------------------------------
// bootstrap todoApp in the page body
let tpl = todoApp()
    .attach(document.getElementById("todoMVC"))
    .refresh({ app: new ts.TodoApp() });
