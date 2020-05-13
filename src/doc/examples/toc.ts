import { $template } from '../../iv';
import w from '../widgets';
import { hello, expressions, subTemplates, loops, section, events, pages } from './base-concepts';
import { trax1, trax2, menu1, menu2 } from './reactivity';
import { controller1, controller2, labels1, labels2, labels3, tabs, photos, clock } from './components';
import { forms1, forms2, forms3, select } from './forms';
import { innerHTML, fragment1, fragment2} from './dynamic-content';


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
            title: "content lazy loading", code: "tabs", content: tabs
        }, {
            title: "querying with labels", code: "labels1", content: labels1
        }, {
            title: "labels in components", code: "labels2", content: labels2
        }, {
            title: "public component methods", code: "labels3", content: labels3
        }, {
            title: "svg components (clock)", code: "clock", content: clock
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
    }, {
        title: "dynamic content",
        code: "content",
        items: [{
            title: "innerHTML", code: "innerHTML", content: innerHTML
        }, {
            title: "$fragment strings", code: "fragment1", content: fragment1
        }, {
            title: "dynamic @fragment", code: "fragment2", content: fragment2
        }]
    }
    ]
}
