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

const todo = xtr`
    <div class="text">
        <h1> Under construction </>
        <p>
            Presentation...
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
            title: "expressions & properties", code: "expressions", content: expressions
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
            title: "trax data objects", code: "todo", content: todo
        }, {
            title: "svg clock", code: "clock", content: clock
        }]
    }]
}
