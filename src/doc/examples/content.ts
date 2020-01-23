import { xtr } from '../../xtr/xtr';

const hello = xtr`
    <div class="text">
        <h1> Hello World </>
        <p>
            Presentation...
        </>
    </>
    <*code @@extract="hello/hello.ts#all" indicators="top;bottom"/>
    <div class="text">
        <p>
            ....
        </>
    </>
    <*code @@extract="hello/pseudocode.ts#mental-model"/>
`;

const expressions = xtr`
    <div class="text">
        <h1> Expressions & properties </>
        <p>
            Presentation....
        </>
    </div>
    <*code @@extract="expressions/expressions.ts#template"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="expressions/expressions.ts#process-function"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="expressions/expressions.ts#instantiation"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="expressions/expressions.ts#update"/>
`;

const subTemplates = xtr`
    <div class="text">
        <h1> Sub-templates </>
        <p>
            Presentation...
        </>
    </div>
    <*code @@extract="subtemplates/subtemplates.ts#main"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="subtemplates/subtemplates.ts#greet"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="subtemplates/subtemplates.ts#text"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="subtemplates/subtemplates.ts#instantiation"/>
`;

const loops = xtr`
    <div class="text">
        <h1> Variables, loops and conditions </>
        <p>
            Presentation...
        </>
    </div>
    <*code @@extract="loops/loops.ts#loop"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="loops/loops.ts#condition"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="loops/loops.ts#instantiation"/>
`;

const events = xtr`
    <div class="text">
        <h1> Event handlers </>
        <p>
            Presentation...
        </>
    </div>
    <*code @@extract="events/events.ts#counter"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="events/events.ts#handleKey"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="events/events.ts#resetCounter"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="events/events.ts#instantiation"/>
`;

const section = xtr`
    <div class="text">
        <h1> Templates with content elements </>
        <p>
            Presentation...
        </>
    </div>
    <*code @@extract="section/section.ts#group"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="section/section.ts#groups"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="section/section.ts#section"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="section/section.ts#sections"/>
`;

const clock = xtr`
    <div class="text">
        <h1> SVG clock </>
        <p>
            Presentation...
        </>
    </div>
    <*code @@extract="clock/clock.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="clock/clock.ts#clock-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="clock/clock.ts#hand-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="clock/clock.ts#instantiation"/>
`;

const trax1 = xtr`
    <div class="text">
        <h1> Trax Data Objects </>
        <p>
            Presentation...
        </>
    </>
    <*code @@extract="trax1/trax1.ts#definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax1/trax1.ts#import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax1/trax1.ts#init"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax1/trax1.ts#update"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax1/trax1.ts#watch-buttons"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax1/trax1.ts#display-functions"/>
`;

const trax2 = xtr`
    <div class="text">
        <h1> Trax Directed Acyclic Graphs </>
        <p>
            Presentation...
        </>
    </>
    <*code @@extract="trax2/trax2.ts#definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax2/trax2.ts#init"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax2/trax2.ts#watch"/>
    <*code @@extract="trax2/trax2.ts#unwatch" indicators=""/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax2/trax2.ts#update-functions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="trax2/trax2.ts#display-functions"/>
`;

const menu1 = xtr`
    <div class="text">
        <h1> Multi-content templates </>
        <p>
            [...]
        </>
    </>
    <*code @@extract="menu1/menu1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="menu1/menu1.ts#data-definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="menu1/menu1.ts#menu"/>
`;

const menu2 = xtr`
    <div class="text">
        <h1> Custom events </>
        <p>
            new concept: define & raise custom events that can be caught through standard @onXXX decorators
        </>
    </>
    <*code @@extract="menu2/menu2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="menu2/menu2.ts#menu"/>
`;

const controller1 = xtr`
    <div class="text">
        <h1> Template controllers & APIs </>
        <p>
            new concepts:
            - explicit API definition
            - template controller
            - private state
            - private methods
        </>
    </>
    <*code @@extract="controller1/controller1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="controller1/keypad.ts#data-definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="controller1/keypad.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="controller1/keypad.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const controller2 = xtr`
    <div class="text">
        <h1> I/O params </>
        <p>
            new concepts:
            - @io params that can be used for input and output
            - {=x.y} 2-way binding expressions
        </>
    </>
    <*code @@extract="controller2/controller2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="controller2/keypad.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="controller2/keypad.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const photos = xtr`
    <div class="text">
        <h1> Life-cycle hooks </>
        <p>
            new concepts: life-cycle hooks: $init
        </>
    </>
    <*code @@extract="photos/photos.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="photos/photos.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="photos/photos.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const tabs = xtr`
    <div class="text">
        <h1> Parameter nodes </>
        <p>
            new concepts: 
            - parameter nodes in API
            - parameter node hierarchy
            - lazy load of unused content / components
            - life-cycle hooks: $init / $beforeRender / $afterRender / $dispose
            - parameter before-render validation
        </>
    </>
    <*code @@extract="tabs/tabs.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="tabs/tabs.ts#heavyComponent"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="tabs/tabset.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="tabs/tabset.ts#template"/>
`;

const todo = xtr`
    <div class="text">
        <h1> Under Construction </>
        <p>
            [...]
        </>
    </>
`;

export default {
    categories: [{
        title: "base concepts",
        code: "base",
        items: [{
            title: "hello world", code: "hello", content: hello
        }, {
            title: "binding expressions", code: "expressions", content: expressions
        }, {
            title: "sub-templates", code: "subtemplates", content: subTemplates
        }, {
            title: "loops & conditions", code: "loops", content: loops
        }, {
            title: "event handlers", code: "events", content: events
        }, {
            title: "templates with content", code: "section", content: section
        }]
    }, {
        title: "reactivity",
        code: "reactivity",
        items: [{
            title: "trax data objects", code: "trax1", content: trax1
        }, {
            title: "trax data graphs", code: "trax2", content: trax2
        }, {
            title: "multi-content templates", code: "menu1", content: menu1
        }, {
            title: "custom events", code: "menu2", content: menu2
        }]
    }, {
        title: "components",
        code: "components",
        items: [{
            title: "controllers & API", code: "controller1", content: controller1
        }, {
            title: "2-way binding params", code: "controller2", content: controller2
        }, {
            title: "life-cycle hooks", code: "photos", content: photos
        }, {
            title: "parameter nodes", code: "tabs", content: tabs
        }, {
            title: "svg clock", code: "clock", content: clock
        }]
    }]
}
