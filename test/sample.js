/**
 * Sketch pad - draft for future syntax
 * Created by blaporte on 31/03/16.
 * Copyright Bertrand Laporte 2016
 */

var Component = () => {
};
var Property = (id) => {
    console.log('evaluated', id);
    return (target, property, descriptor) => console.log('executed', id);
};

//@Component()
class MyComponent {
    @Property(1)
    myprop;

    constructor() {
        this.myprop = "aaa";
    }

    static getTemplate() {
        return iv`
            <import ${mycomponents}/>
            
            <template bar:boolean=false c:MyComponent >
                <Section #main>
                    <div @title><img src=”foo.png”/>Hello</div>
                    % if (c.bar) {
                        <div content data-foo=1+2+3+c.blah >
                            <section #child title=”World”>
                                <div @content>blah</div>
                                <template @tadaa x y z>
                                    <Foo [blah]=x [bar]=y+2 [z]=z/>
                                </template>
                            </section>
                        </div>
                    % }
                </Section>
            </template>
        `;
    }
}


var samples = iv`
    // template that receives a IvNodeList as argument
    <template #Call1>
        <Cpt1>
            <div @title>Some text and <img/></div>
        </Cpt1>
    </template>
    <template #Cpt1 title:IvNodeList>
        Text before
        {{title}}
        Text after
    </template>
    
    // template that receives another template as argument
    <template #Call2 bar>
        <Cpt2>
            <template @dosth arg1>
                // arg1 will be passed by Cpt2
                Some Text
                {{bar}} + {{arg1}} // equivalent to closure
            </template>
        </Cpt2>
    </template>
    <template #Cpt2 dosth:IvTemplate="DefaultTemplate"> // default: either template id or template ref
        Text before
        % var rnd = Math.random();
        <apply template=dosth [arg1]=rnd/>
        // or
        % var foo = dosth.apply({arg1:rnd});
        Text after
    </template>
    
    // sample tabset usage
    <template #Call3 c:MyComponent>
        <TabSet [[selection]]=c.selection>
            <div @tab #tab1 title="First tab">
                Content 1    
            </div>
            <div @tab #tab2>
                <div @title>Title 2</div>
                Content 2
            </div>
            <div @tab #tab3>
                <div @title>Title 2</div>
                <div @content>Content 3</div>
            </div>
        </TabSet>
    </template>
`

var iv = function (strings, ...values) {
};

// possible code generation..
var pkg = iv`
    <template #foo bar baz c>
        <div [title]=c.getTitle()>abc</div>
        <div #x>
            <div #y></div>
            % if (baz) {
            <div #z></div>
            % }
        </div>
    </template>
`;

// simple node
// nested nodes
// text node
// insert node
// js expression
// js block / nested blocks
// comment blocks?
// no-value attributes
// bound 1- and 2-ways attribute
// deferred function attribute
// Component nodes
// @nodes

function foo($v, $n, $s, $e, $a, bar, baz, c) {
    $s(0, c.getTitle()); // div
    $a('content'); // ######### should be by default and shouldn't be generated here
    $n(1); // abc
    $e(0); // /div

    $s(2); // div#x
    $n(3); // div#y
    $s(4); // if (baz) {
    if (baz) {
        $n(5); // div #z
    }
    $e(4); // }
    $e(2); // /div#x
}
foo.statics = [
    [0, 3, "div"],
    [1, 1, "abc"],
    [2, 3, "div", {'id': 'x'}]
]

// possible code generation..
var pkg1 = iv`
    <template #foo bar baz c>
        <div [title]=c.getTitle()>abc</div>
        <div #x>
            <div #y></div>
            % if (baz) {
            <div #z></div>
            % }
        </div>
    </template>
`;

// simple node
// nested nodes
// text node
// insert node
// js expression
// js block / nested blocks
// comment blocks?
// no-value attributes
// bound 1- and 2-ways attribute
// deferred function attribute
// Component nodes
// @nodes
var Section = {} // component object

var pkg = `
    <import ${Section}/> // or <import src=${Section}/> or <import ${[Section, MyWidget]}/>
    
    <template #info person>
        % if (!person) {
            <div class="main" [class.vip]=person.vip>
                % var text = person.title + " " + person.lastName;
                <Section [class.dark]=(55<person.age)>
                    <div @title> {{text}} </div>
                    <div $foo>Some content here<br/>and here</div>
                    <personDetails [person]=person> // or <insert template=personDetails [person]=person> ...</insert>
                        <div @msg><img src="warning.png"/> This is a message! </div>
                    </personDetails>
                </Section>
            </div>
        % } else {
            <div class="nodata"> Sorry - no data available </div>
        % }
    </template>
    
    <template #personDetails person msg:IvNode=null>
        % var properties = ["firstName", "lastName", "age", "gender"];
        % for (var k in properties) {
            <div class="detail">
                <span class="key">{{k}}: </span>
                <span class="value">{{person[k]}}</span>
            </div>
            % if (msg) {
                <div class="msg">{{msg}}</div>
            % }
        % }
        {{msg}}
    </template>
    
    // template using tabbars
    <template #tabbarTest selectedTab="A" show3=true onchange:Function>
        <tabbar [selection]=selectedTab (onselection)=onchange($event.selection)>
            <div @tab key="A">
                <div @title> First tab </div>
                First tab content
            </div>
            
            <div @tab key="B" title="Second tab">
                Second tab content
            </div>
            
            % if (show3) {
                <div @tab key="C" title="Third tab">
                    Third tab content (optional)
                </div>
            % /}
        </tabbar>
    </template>
    
`

// Using it
var tpl = HtmlRenderer.render("mydiv", pkg.info.apply(myperson)); // arguments could be passed by name or by position

// Refresh after data change
tpl.refresh(myperson2);

// General structure of pre compiled code
pkg = (function () {
    var importContainer = {}; // generate appropriate code here
    return {
        info: iv.$template({
                templateFn: function ($c, $n, $e, $a, person) {
                    var $v = $c.$v, personDetails = $c.$pkg.personDetails;
                    person = person || {};

                    $c.n(0);
                    if (!person) {
                        $c.n(1, 14); // can be optimized when contains only one node
                        $n(1, 1, person.vip);
                        var text = person.title + " " + person.lastName;
                        $n(2, 15, 55 < person.age);
                        $a("title");
                        $n(3, 3);
                        $n(4, 12);
                        $n(5, 3);
                        $a("content");
                        $n(6, 12, personDetails.apply(person));
                        $e(2);
                        $e(1);
                        $e(0);
                    } else {


                    }
                    $c.e(0);
                },
                templateStatics: [ // statics
                    [0, 14], // JS block
                    [1, "div",
                        {
                            "class": "main"
                        }
                        ,
                        [["class", "vip"]]
                    ],       // <div class="main" [class.vip]=person.vip>
                    [2, "Section"],
                    [3, " "],
                    [4],
                    [5, " "],
                    [6]
                ],
                importContainer: importContainer
            }
        )
    }
})();

// ########################
// Sample todo mvc - from angular 2 sample in todomvc

// event handlers
// support $this? and $event in event handlers
// double binding on text fields -> value / onvaluechange, selection / onselectionchange

// dotted properties: onkeyup.enter, class.completed


var pkg = iv `
    <template #todolist todoCtl todoStore>
        <section class="todoapp">
            <header class="header">
                <h1>todos</h1>
                <input class="new-todo" placeholder="What needs to be done?" autofocus="" 
                [[value]]="todoCtl.newTodoText" (onkeyup.enter)="todoCtl.addTodo()">
            </header>
        </section>
        % if (todoStore.todos.length) {
            <section class="main">
                <input class="toggle-all" type="checkbox" [checked]=todoStore.allCompleted() (onclick)=todoStore.setAllTo($this.checked)>
                <ul class="todo-list">
                    % for (var i=0;todoStore.todos.length>i;i++) {
                        % var todo = todoStore.todos[i];
                        <li [class.completed]=todo.completed [class.editing]=todo.editing>
                            <div class="view">
                                <input class="toggle" type="checkbox" (onclick)=todoCtl.toggleCompletion(todo) [checked]=todo.completed>
                                <label (ondblclick)=todoCtl.editTodo(todo)>{{todo.title}}</label>
                                <button class="destroy" (onclick)=todoCtl.remove(todo)></button>
                            </div>
                            % if (todo.editing) {
                                <input class="edit" [value]=todo.title (onblur)=todoCtl.stopEditing(todo, $this.value) 
                                (onkeyup.enter)=todoCtl.updateEditingTodo(todo, $this.value) (onkeyup.escape)=todoCtl.cancelEditingTodo(todo)>
                            % }
                        </li>
                    % }
                </ul>
            </section>
            <footer class="footer">
                <span class="todo-count">
                    <strong>{{todoStore.getRemaining().length}}</strong> {{todoStore.getRemaining().length == 1 ? 'item' : 'items'}} left
                </span>
                % if (todoStore.getCompleted().length) {
                    <button class="clear-completed" (onclick)="removeCompleted()">Clear completed</button>
                % }
            </footer>
        % }
    </template>
`


// ########
// ideas for canvas support


