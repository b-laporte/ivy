import { $template } from '../../iv';
import w from '../widgets';
import { hello, expressions, subTemplates, loops } from './base-concepts';


const events = $template`() => {
    <div class="text">
        <h1> Event handlers </>
        <*w.notions>
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
    <*w.code @@extract="events/events.ts#counter"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="events/events.ts#handleKey"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="events/events.ts#resetCounter"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="events/events.ts#instantiation"/>
}`;

const pages = $template`() => {
    <div class="text">
        <h1> Dynamic template references </>
        <*w.notions>
            <.notion name="Using dynamic component references"> to implement some kind of visual navigation </>
        </>
        <p>
            Presentation...
        </>
    </div>
    <*w.code @@extract="pages/pages.ts#main"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="pages/pages.ts#pages"/>
}`;

const section = $template`() => {
    <div class="text">
        <h1> Templates with content elements </>
        <*w.notions>
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
    <*w.code @@extract="section/section.ts#groups"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="section/section.ts#group"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="section/section.ts#sections"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="section/section.ts#section"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="section/section.ts#instantiation"/>
}`;

const clock = $template`() => {
    <div class="text">
        <h1> SVG clock </>
        <*w.notions>
            <.notion name="SVG"> as any other HTML elements </>
            <.notion name="$dispose"> life cycle hook </>
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#clock-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#hand-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#instantiation"/>
}`;

const trax1 = $template`() => {
    <div class="text">
        <h1> Trax Data Objects </>
        <*w.notions>
            <.notion name="trax objects"> to define data objects that can be tracked/watched </>
            <.notion name="watch / unwatch"> to be asynchronously called when an object has changed </>
            <.notion name="object version"> to follow a trax object life cycle </>
        </>
        <p>
            Presentation...
        </>
    </>
    <*w.code @@extract="trax1/trax1.ts#definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax1/trax1.ts#import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax1/trax1.ts#init"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax1/trax1.ts#update"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax1/trax1.ts#watch-buttons"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax1/trax1.ts#display-functions"/>
}`;

const trax2 = $template`() => {
    <div class="text">
        <h1> Trax Directed Acyclic Graphs </>
        <*w.notions>
            <.notion name="connected trax objects"> to defined a DAG of data objects </>
            <.notion name="change propagation"> to track changes in the child hierarchy </>
        </>
        <p>
            Presentation...
        </>
    </>
    <*w.code @@extract="trax2/trax2.ts#definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax2/trax2.ts#init"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax2/trax2.ts#watch"/>
    <*w.code @@extract="trax2/trax2.ts#unwatch" indicators=""/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax2/trax2.ts#update-functions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="trax2/trax2.ts#display-functions"/>
}`;

const menu1 = $template`() => {
    <div class="text">
        <h1> Multi-content templates </>
        <*w.notions>
            <.notion name="explicit API type"> to define the template api as a trax object </>
            <.notion name="@API decorator"> to specify API (trax) classes </>
            <.notion name="param nodes"> to specify rich hierarchy of content parameters </>
        </>
        <p>
            [...]
        </>
    </>
    <*w.code @@extract="menu1/menu1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="menu1/menu1.ts#data-definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="menu1/menu1.ts#menu"/>
}`;

const menu2 = $template`() => {
    <div class="text">
        <h1> Custom events </>
        <*w.notions>
            <.notion name="IvEventEmitter"> to define custom events that can be caught through standard @onXXX decorators </>
        </>
        <p>
            ...
        </>
    </>
    <*w.code @@extract="menu2/menu2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="menu2/menu2.ts#menu"/>
}`;

const controller1 = $template`() => {
    <div class="text">
        <h1> Template controllers & APIs </>
        <*w.notions>
            <.notion name="@Controller"> to define private state and methods associated to a template </>
            <.notion name="$api property"> to define the public api associated to a controller </>
        </>
        ...
    </>
    <*w.code @@extract="controller1/controller1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller1/keypad.ts#data-definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller1/keypad.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller1/keypad.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

const controller2 = $template`() => {
    <div class="text">
        <h1> I/O params </>
        <*w.notions>
            <.notion name="@io params"> to define params that are both input and output </>
            <.notion name="2-way biding expressions"> e.g. !{=x.y!} </>
            <.notion name="setting or removing attributes"> e.g. to enable or disable an input or button </>
        </>
        ...
    </>
    <*w.code @@extract="controller2/controller2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller2/keypad.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller2/keypad.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

const photos = $template`() => {
    <div class="text">
        <h1> Life-cycle hooks </>
        <*w.notions>
            <.notion name="life-cycle hooks"> to define specific hooks on the template controller </>
            <.notion name="$init hook"> to perform some initialization when all parameters are defined </>
        </>
    </>
    <*w.code @@extract="photos/photos.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="photos/photos.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="photos/photos.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

const tabs = $template`() => {
    <div class="text">
        <h1> Parameter nodes lazy loading </>
        <*w.notions>
            <.notion name="content lazy loading"> to avoid heavy processing in unused $content and parameter nodes </>
            <.notion name="$beforeRender & $afterRender hooks"> to perform some processing before / after render </>
        </>
    </>
    <*w.code @@extract="tabs/tabs.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="tabs/tabs.ts#heavyComponent"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="tabs/tabset.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="tabs/tabset.ts#template"/>
}`;

const labels1 = $template`() => {
    <div class="text">
        <h1> Labels </>
        <*w.notions>
            <.notion name="#labels"> as a mean to get a reference to dom elements </>
            <.notion name="query() method"> to retrieve template elements that have been rendered </>
        </>
    </>
    <*w.code @@extract="labels1/labels1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels1/labels1.ts#focusTitle"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels1/labels1.ts#focus3rd"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels1/labels1.ts#focusNext"/>
}`;

const labels2 = $template`() => {
    <div class="text">
        <h1> !$template injection </>
        <*w.notions>
            <.notion name="$template injection"> to access the IvTemplate API in the rendering function or in the template controller </>
            <.notion name="query() from controller methods"/>
        </>
    </>
    <*w.code @@extract="labels2/labels2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels2/labels2.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels2/labels2.ts#controller"/>
}`;

const labels3 = $template`() => {
    <div class="text">
        <h1> Component API methods </>
        <*w.notions>
            <.notion name="API methods"> to expose public methods to component callers </>
            <.notion name="#labels on components"> to retrieve a component's api </>
        </>
    </>
    <*w.code @@extract="labels3/labels3.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels3/labels3.ts#actions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels3/labels3.ts#item-component"/>
}`;

const forms1 = $template`() => {
    <div class="text">
        <h1> Input bindings </>
        <*w.notions>
            <.notion name="@value decorator"> to bind input and textareas to data models </>
            <.notion name="template uid"> to create unique ids/labels </>
        </>
    </>
    <*w.code @@extract="forms1/forms1.ts#data-model"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms1/forms1.ts#form"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms1/forms1.ts#value-import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms1/forms1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

const forms2 = $template`() => {
    <div class="text">
        <h1> Input binding options </>
        <*w.notions>
            <.notion name="@value debounce parameter"> to delay change events and prevent bursting </>
            <.notion name="@value events"> to specify which events should be used (on top of "change") </>
        </>
    </>
    <*w.code @@extract="forms2/forms2.ts#form"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms2/forms2.ts#options"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms2/forms2.ts#options-editor"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

const forms3 = $template`() => {
    <div class="text">
        <h1> Input bindings data conversion </>
        <*w.notions>
            <.notion name="@value input2data & data2input"> to convert data between input and data model </>
        </>
    </>
    <*w.code @@extract="forms3/forms3.ts#data-model"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms3/forms3.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms3/forms3.ts#conversions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

const select = $template`() => {
    <div class="text">
        <h1> Textarea and Select </>
        <*w.notions>
            <.notion name="@value for textarea and select elements"/>
        </>
    </>
    <*w.code @@extract="select/select.ts#main"/>
}`;

const innerHTML = $template`() => {
    <div class="text">
        <h1> Unsafe InnerHTML </>
        <*w.notions>
            <.notion name="@unsafeInnerHTML"> to (unsafely) inject an html string into an element </>
        </>
    </>
    <*w.code @@extract="innerHTML/innerHTML.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="innerHTML/innerHTML.ts#innerHTML-import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

// const xtr1 = $template`() => {
//     <div class="text">
//         <h1> XTR strings </>
//         <*w.notions>
//             <.notion name="XTR strings"> to define safe HTML fragments that can be dynamically downloaded & rendered </>
//             <.notion name="@xtrContent"> to safely inject XTR content in an element </>
//             <.notion name="@xtrContent resolver"> to specify which references are accessible to XTR fragments </>
//         </>
//     </>
//     <*w.code @@extract="xtr1/xtr1.ts#main"/>
//     <div class="text">
//         <p>
//             Some comment
//         </>
//     </div>
//     <*w.code @@extract="xtr1/xtr1.ts#xtr-import"/>
//     <div class="text">
//         <p>
//             Some comment
//         </>
//     </div>
//     <*w.code @@extract="xtr1/xtr1.ts#resolver"/>
//     <div class="text">
//         <p>
//             Some comment
//         </>
//     </div>
//     <*w.code @@extract="xtr1/xtr1.ts#template"/>
//     <div class="text">
//         <p>
//             Some comment
//         </>
//     </div>
// }`;

// const xtr2 = $template`() => {
//     <div class="text">
//         <h1> Static XTR strings </>
//         <*w.notions>
//             <.notion name="static XTR strings"> that are validated and pre-processed at compile time </>
//             <.notion name="XTR special characters" />
//             <.notion name="XTR cdata sections"/>
//         </>
//     </>
//     <*w.code @@extract="xtr2/xtr2.ts#content"/>
//     <div class="text">
//         <p>
//             Some comment
//         </>
//     </div>
//     <*w.code @@extract="xtr2/xtr2.ts#xtr-import"/>
//     <div class="text">
//         <p>
//             Some comment
//         </>
//     </div>
//     <*w.code @@extract="xtr2/xtr2.ts#main"/>
//     <div class="text">
//         <p>
//             Some comment
//         </>
//     </div>
// }`;

const todo = $template`() => {
    <div class="text">
        <h1> Under Construction </>
        <p>
            [...]
        </>
    </>
}`;

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
        }, {
            title: "dynamic references", code: "pages", content: pages
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
        }, {
            title: "textarea & select", code: "select", content: select
        }]
    }
        // , {
        //     title: "dynamic content",
        //     code: "content",
        //     items: [{
        //         title: "innerHTML", code: "innerHTML", content: innerHTML
        //     }, {
        //         title: "xtr strings", code: "xtr1", content: xtr1
        //     }, {
        //         title: "static xtr strings", code: "xtr2", content: xtr2
        //     }]
        // }
    ]
}
