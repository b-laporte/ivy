import { xtr } from '../../xtr/xtr';

const hello = xtr`
    <div class="text">
        <h1> Hello World </>
        <*notions>
            <.notion name="XJS template functions"> XJS basics: template, elements and text nodes </>
            <.notion name="template arguments"> create template parameters </>
            <.notion name="template instantiation"> create and render a template instance </>
            <.notion name="mental model & code generation"> understand how ivy works and how to debug </>
        </>
        <p>
            ...
        </>
    </>
    <*code @@extract="hello/hello.ts#all" indicators="top;bottom"/>
    <div class="text">
        <p>
            ....
        </>
    </>
    <*code @@extract="hello/pseudocode.ts#mental-model"/>
    <div class="text">
        <p>
            ....
        </>
    </>
    <*code @@extract="hello/generated.ts#all"/>
`;

const expressions = xtr`
    <div class="text">
        <h1> Expressions & properties </>
        <*notions>
            <.notion name="binding expressions"> bind JS values to DOM elements and text nodes </>
            <.notion name="attributes vs. properties"> target DOM attributes or properties </>
            <.notion name="one-time bindings"> avoid recalculating expressions that don't change (e.g. translation values) </>
            <.notion name="manual re-rendering"> to synchronously (re-)render a template instance </>
        </>
        <p>
            ....
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
        <*notions>
            <.notion name="sub-templates"> calling a template from another template </>
            <.notion name="arguments default values"> to specify the default value of a template parameter</>
        </>
        <p>
            ...
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
        <*notions>
            <.notion name="JS statements"> using js statements to control template rendering output </>
            <.notion name="array arguments naming convention"> e.g. xxxList </> 
            <.notion name="debugging"> with console.log(...) or debugger statements </> 
        </>
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
        <*notions>
            <.notion name="XJS decorators"> to implement specific logic on an XJS element </>
            <.notion name="event handlers"> to trigger actions on DOM events </>
            <.notion name="function expressions"> to pass a function as an expression value </>
            <.notion name="event handlers options"> to pass to the DOM addEventListener() method </>
            <.notion name="$ parameter"> to retrieve the object that holds all template parameters </>
        </>
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
        <*notions>
            <.notion name="container templates"> i.e. template that accept content as argument </>
            <.notion name="@content decorator"> to re-inject some content passed as argument </>
            <.notion name="XJS fragment nodes"> to group XJS nodes without creating any DOM container elements </>
            <.notion name="$content parameter"> i.e. the default template content </>
            <.notion name="simple param nodes"> to accept multiple content values </>
        </>
        <p>
            Presentation...
        </>
    </div>
    <*code @@extract="section/section.ts#groups"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="section/section.ts#group"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*code @@extract="section/section.ts#sections"/>
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
    <*code @@extract="section/section.ts#instantiation"/>
`;

const clock = xtr`
    <div class="text">
        <h1> SVG clock </>
        <*notions>
            <.notion name="SVG"> as any other HTML elements </>
            <.notion name="$dispose"> life cycle hook </>
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
        <*notions>
            <.notion name="trax objects"> to define data objects that can be tracked/watched </>
            <.notion name="watch / unwatch"> to be asynchronously called when an object has changed </>
            <.notion name="object version"> to follow a trax object life cycle </>
        </>
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
        <*notions>
            <.notion name="connected trax objects"> to defined a DAG of data objects </>
            <.notion name="change propagation"> to track changes in the child hierarchy </>
        </>
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
        <*notions>
            <.notion name="explicit API type"> to define the template api as a trax object </>
            <.notion name="@API decorator"> to specify API (trax) classes </>
            <.notion name="param nodes"> to specify rich hierarchy of content parameters </>
        </>
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
        <*notions>
            <.notion name="IvEventEmitter"> to define custom events that can be caught through standard @onXXX decorators </>
        </>
        <p>
            ...
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
        <*notions>
            <.notion name="@Controller"> to define private state and methods associated to a template </>
            <.notion name="$api property"> to define the public api associated to a controller </>
        </>
        ...
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
        <*notions>
            <.notion name="@io params"> to define params that are both input and output </>
            <.notion name="2-way biding expressions"> e.g. {=x.y} </>
        </>
        ...
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
        <*notions>
            <.notion name="life-cycle hooks"> to define specific hooks on the template controller </>
            <.notion name="$init hook"> to perform some initialization when all parameters are defined </>
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
        <h1> Parameter nodes lazy loading </>
        <*notions>
            <.notion name="content lazy loading"> to avoid heavy processing in unused $content and parameter nodes </>
            <.notion name="$beforeRender & $afterRender hooks"> to perform some processing before / after render </>
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

const labels1 = xtr`
    <div class="text">
        <h1> Labels </>
        <*notions>
            <.notion name="#labels"> as a mean to get a reference to dom elements </>
            <.notion name="query() method"> to retrieve template elements that have been rendered </>
        </>
    </>
    <*code @@extract="labels1/labels1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="labels1/labels1.ts#focusTitle"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="labels1/labels1.ts#focus3rd"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="labels1/labels1.ts#focusNext"/>
`;

const labels2 = xtr`
    <div class="text">
        <h1> $template injection </>
        <*notions>
            <.notion name="$template injection"> to access the IvTemplate API in the rendering function or in the template controller </>
            <.notion name="query() from controller methods"/>
        </>
    </>
    <*code @@extract="labels2/labels2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="labels2/labels2.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="labels2/labels2.ts#controller"/>
`;

const labels3 = xtr`
    <div class="text">
        <h1> Component API methods </>
        <*notions>
            <.notion name="API methods"> to expose public methods to component callers </>
            <.notion name="#labels on components"> to retrieve a component's api </>
        </>
    </>
    <*code @@extract="labels3/labels3.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="labels3/labels3.ts#actions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="labels3/labels3.ts#item-component"/>
`;

const forms1 = xtr`
    <div class="text">
        <h1> Input bindings </>
        <*notions>
            <.notion name="@value decorator"> to bind input and textareas to data models </>
            <.notion name="template uid"> to create unique ids/labels </>
        </>
    </>
    <*code @@extract="forms1/forms1.ts#data-model"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="forms1/forms1.ts#form"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="forms1/forms1.ts#value-import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="forms1/forms1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const forms2 = xtr`
    <div class="text">
        <h1> Input binding options </>
        <*notions>
            <.notion name="@value debounce parameter"> to delay change events and prevent bursting </>
            <.notion name="@value events"> to specify which events should be used (on top of "change") </>
        </>
    </>
    <*code @@extract="forms2/forms2.ts#form"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="forms2/forms2.ts#options"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="forms2/forms2.ts#options-editor"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const forms3 = xtr`
    <div class="text">
        <h1> Input bindings data conversion </>
        <*notions>
            <.notion name="@value input2data & data2input"> to convert data between input and data model </>
        </>
    </>
    <*code @@extract="forms3/forms3.ts#data-model"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="forms3/forms3.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="forms3/forms3.ts#conversions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const innerHTML = xtr`
    <div class="text">
        <h1> Unsafe InnerHTML </>
        <*notions>
            <.notion name="@unsafeInnerHTML"> to (unsafely) inject an html string into an element </>
        </>
    </>
    <*code @@extract="innerHTML/innerHTML.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="innerHTML/innerHTML.ts#innerHTML-import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const xtr1 = xtr`
    <div class="text">
        <h1> XTR strings </>
        <*notions>
            <.notion name="XTR strings"> to define safe HTML fragments that can be dynamically downloaded & rendered </>
            <.notion name="@xtrContent"> to safely inject XTR content in an element </>
            <.notion name="@xtrContent resolver"> to specify which references are accessible to XTR fragments </>
        </>
    </>
    <*code @@extract="xtr1/xtr1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="xtr1/xtr1.ts#xtr-import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="xtr1/xtr1.ts#resolver"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="xtr1/xtr1.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
`;

const xtr2 = xtr`
    <div class="text">
        <h1> Static XTR strings </>
        <*notions>
            <.notion name="static XTR strings"> that are validated and pre-processed at compile time </>
            <.notion name="XTR special characters" />
            <.notion name="XTR cdata sections"/>
        </>
    </>
    <*code @@extract="xtr2/xtr2.ts#content"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="xtr2/xtr2.ts#xtr-import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="xtr2/xtr2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
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
            title: "templates with content", code: "section", content: section
        }, {
            title: "event handlers", code: "events", content: events
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
            title: "controllers & APIs", code: "controller1", content: controller1
        }, {
            title: "2-way binding params", code: "controller2", content: controller2
        }, {
            title: "life-cycle hooks", code: "photos", content: photos
        }, {
            title: "parameter nodes", code: "tabs", content: tabs
        }, {
            title: "labels", code: "labels1", content: labels1
        }, {
            title: "$template injection", code: "labels2", content: labels2
        }, {
            title: "public api methods", code: "labels3", content: labels3
        }, {
            title: "svg clock", code: "clock", content: clock
        }]
    }, {
        title: "forms",
        code: "forms",
        items: [{
            title: "input bindings", code: "forms1", content: forms1
        }, {
            title: "debounce & change events", code: "forms2", content: forms2
        }, {
            title: "data adaptation", code: "forms3", content: forms3
        }]
    }, {
        title: "dynamic content",
        code: "content",
        items: [{
            title: "innerHTML", code: "innerHTML", content: innerHTML
        }, {
            title: "xtr strings", code: "xtr1", content: xtr1
        }, {
            title: "static xtr strings", code: "xtr2", content: xtr2
        }]
    }]
}
