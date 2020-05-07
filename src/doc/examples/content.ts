import { $template } from '../../iv';
import w from '../widgets';
import { hello, expressions, subTemplates, loops, section, events, pages } from './base-concepts';
import { trax1, trax2, menu1, menu2 } from './reactivity';
import { controller1, controller2, labels1, labels2, labels3, tabs, photos, clock } from './components';
import { forms1, forms2, forms3, select } from './forms';

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
            title: "sub-templates & libraries", code: "subtemplates", content: subTemplates
        }, {
            title: "loops & conditions", code: "loops", content: loops
        }, {
            title: "templates with content", code: "section", content: section
        }, {
            title: "event handlers", code: "events", content: events
        }, {
            title: "page navigation", code: "pages", content: pages
        }]
    }, {
        title: "reactivity",
        code: "reactivity",
        items: [{
            title: "trax data objects", code: "trax1", content: trax1
        }, {
            title: "trax data graphs", code: "trax2", content: trax2
        }, {
            title: "param nodes hierarchy", code: "menu1", content: menu1
        }, {
            title: "custom events (event emitters)", code: "menu2", content: menu2
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
            title: "param nodes", code: "tabs", content: tabs
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
