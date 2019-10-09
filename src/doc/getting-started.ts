import { IvContent } from './../iv/types';
import { template, Controller, API } from "../iv";
import { Data } from '../trax';
import { IvEventEmitter } from '../iv/events';

// IVY - Getting started
// - Base concepts
//     - Template functions & code generation
//         - template = factory
//     - Elements, text nodes, and code generation mental model
//         -> VS extension
//     - Template parameters and simple expressions
//     - JS statements, loops and conditions
// - Simple components, expressions and change detection
//     - Simple components (aka. sub-templates)
//     - Params and properties
//         - No-values param
//     - Value types: literal or expressions
//     - One-time, function and bi-directional binding expressions
//     - Expression shortcuts
// - Listening to events
//     - simple listeners
//     - advanced listener options
// - Components with content (aka. containers) and decorators
//     - Components with content, projection with @content decorator
//     - Components with multiple named contents
//     - Complex content: param nodes
//     - Ordered parameter nodes: $childParams
//     - Public API
// - Rich Components
//     - Controllers
//     - Change detection and render/refresh
//     - Life cycle hooks: $init, $beforeRender, $afterRender, $dispose
//     - API methods
//     - Custom events: IvEventEmitter
// - Labels
//     - labels
//     - Conditional labels: #xxx={expr()}
//     - #main 
//     - public labels: $labels
//     - forward labels
// - Forms
//     - Direct binding to inputs: @paramValue
//     - Binding to a form model: @model
// - Custom decorators
//     - Simple decorators
//     - Decorators with multiple arguments
//     - Decorator Nodes
// - XTML
//     - Static documents & safer insertion: @innerXTML
//     - XTML elements, text, components
//         -> VS extension
// - Advanced
//     - Keyed iteration
//     - SVG?

// --------------------------------------------------------------------------------------------------------------------------
// # Base concepts

/**
 * Template function and code generation
 * template() returns a factory.
 * Each template instances created by the factory can be attached to the HTML DOM and
 */
const hw = template(`() => {
    <div class="hw">
        # Hello World #
    </div>
}`);

let hello = hw()             // return hello
    .attach(document.body)   // return hello
    .render();               // return hello

// explain: explicit text nodes, code generation as JS statements



/**
 * Template with dynamic arguments and simple expression
 */
const greeting = template(`(name:string, cls:string = "hw") => {
    <div class={cls}>
        # Hello {name} #
    </div>
}`);

// arguments defined as function arguments, types are optional (but recommended :-))
// {name} and {cls} are expressions -> any JS expression can be used inside the curly brackets (e.g. {foo(bar())*42})
// note about naming conventions: argument names cannot start with "$" which is reserved for ivy specific keywords
// recommended: VsCode extension to get syntax highlighting

let g = greeting().attach(document.body);
g.render({ name: "World" }); // create the g DOM with an " Hello World " text node and a "hw" class on the div
g.render({ name: "Brave New World" }); // update the previous text node with " Hello Brave New World " - "hw" class unchanged



/**
 * JS statements, loops and conditions
 * ivy templates should be read as a JS function
 */
const greetings = template(`(names) => { // equivalent to (api, $) => {let name=api["name"];
    let count=0;
    <div class="greetings">              // equivalent to $.startElement("div, {"class":"greetings"});
        for (let name of names) {
            <span>                       // equivalent to $.startElement("span");
                count++;
                # Hello #                // equivalent to $.textNode(" Hello "});
                if (count%2) {
                    <b> #{name}# </b>    // equivalent to $.startElement("b"); $.textNode(name}); $.endElement();
                } else {
                    # {name}(!) #        // equivalent to $.textNode(" "+name+"(!) "});
                }
            </span>                      // equivalent to $.endElement();
        }
    </>                                  // shortcut for </div> - equivalent to $.endElement();
}`);

greeting().attach(document.body).render({ names: ["Marge", "Lisa"] });
// renders:
// <div class="greetings">
//   <span> Hello <b>Marge</b></span>
//   <span> Hello Lisa(!) </span>
// </div>



// --------------------------------------------------------------------------------------------------------------------------
// # Simple components, expressions and change detection

/**
 * Templates can be used (or "called") from other templates
 * For this we need to use the '*' prefix to differentiate template calls (aka. components) from HTML elements
 */
const greetings2 = template(`(names:string[]) => { 
    <div class= "g2">
        for (let name of names) {
            <*greet name={name}/> // equivalent to $.call(greet, {name:name});
        }
    </>
}`);

const greet = template(`(name:string) => {
    <div> # Hello {name} # </div>
}`);

// in this case greet simply needs to be in the template JS scope (it could even be passed as template argument)
// in practice: simply use JS modules to manage template libraries, like for any other JS entity

/**
 * Params vs props: calling element.setAttribute(name, "value") vs element["name"]=value;
 * xxx=...   : param attribute (=attribute for DOM Elements, param for component calls)
 * [xxx]=... : property attribute
 */
const paramAndProps = template(`() => {
    <div class="abc"            // equivalent to theDiv.setAttribute("class", "abc");
        [className]={expr()}    // equivalent to theDiv.className = expr();
    >
        // note: no-values attribute can also be used
        <button disabled/>      // equivalent to theButton.setAttribute("disabled","")

        <*greet name="World"    // no property can be used here as attribute and properties are equivalent in this case
            disabled            // equivalent to disabled=true (component params consider no-value attributes as booleans)
        />
    </>
}`);


/** 
 * Params and properties can accept literal or expressions values
 * Literal values: string, boolean or simple number (i.e. in the form of 123 or 12.3)
 * Expression values: 
 *     standard binding: {expr()}
 *     one-time binding: {::expr()}
 *     function shortcut: {=>expr()}
 *     bi-directional bindings: {=a.b.c}
 */
const expressions = template(`(expr:Function, data) => {
    <input type="text"                           // double-quote string
           title='def'                           // single-quote string
           aria-label={expr()}                   // standard binding: the param is updated at each render()
           role={::expr("role")}                 // one-time binding: only processed at first render()
    />
    <*creditCardField 
           enabled=true                          // boolean
           month={=data.month}                   // bi-directional binding: if month changes -> data.month is updated, and if data.month changes, month is updated
           year={=data.year}                     // bi-directional binding
           validator={(m,y) => m<12 && y<2042}   // standard function value
           someFunction={=>expr()===42}          // function shortcut: equivalent to {() => expr()===42}
    />
}`);
// note: bi-directional binding is not yet supported


/**
 * Expression shortcuts - to avoid repeating the same identifier twice
 */
const shortcuts = template(`(firstName, lastName, title) => {
    <*myComponent 
        {firstName}         // equivalent to firstName={firstName}
        {::lastName}        // equivalent to lastName={::lastName}
    />
    <div {[title]} />       // equivalent to [title]={title}
    <span {::[title]} />    // equivalent to [title]={::title}
}`);


// --------------------------------------------------------------------------------------------------------------------------
// # Events

/**
 * Listening to events
 * Ivy defines a built-in decorator to add event listeners to elements (and to components 
 * - but this will be explained in a laster section)
 * In its simplest form the decorator simply takes as argument the listener function 
 * that should be called when the event occurs
 */
const eventSample1 = template(`() => {
    <div @onclick={doSomething}> # Hello # </div>
}`);
function doSomething(e: Event) {
    console.log("Event:", e);
}

/**
 * If we need to capture some local variables, like an index in a loop, then
 * an inline function can be used
 */
const eventSample2 = template(`() => {
    for (i=0; 10>i; i++) {
        <div @onclick={e=>doSomething(i,e)}> # Hello {i+1} # </div>
    }
}`);
function doSomething2(index: number, e: Event) {
    console.log("Event:", index, e);
}

/**
 * For advanced cases, an 'options' parameter can also be passed to the event listener
 * decorator, according to the specifications of the DOM addEventListener() method 
 * cf. https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * 
 * Note: decorators can accept multiple parameters - in this case they must be grouped
 * with parens '()' - like in this example (cf. decorator section for more details)
 */
const eventSample3 = template(`() => {
    <div class="main" @onclick(listener={doSomething} options={{capture:true}})>
        # Click me #
    </div>
}`);




// --------------------------------------------------------------------------------------------------------------------------
// # Components with content (aka. containers) and decorators

/**
 * Components can accept content that will be passed to the template render function
 * through a specific parameter named $content
 * The projection of the $content value is done through a built-in decorator named @content
 * Note: ivy supports built-in and custom decorators. Decorators are entities that implement
 * specific behaviors that go beyond simple setAttribute() or properties.
 */
const messageSample = template(`() => {
    <*message type="warning">
        // message $content
        <span> # This content # </span>
        <span> # will be projected in the message body # </span>
    </>
}`);

const message = template(`(type:string, $content:IvContent) => {
    <div class={"message "+type} @content={$content}/>
    // note in this specific case '={$content}' can be omitted
}`);
// note IvContent needs to be imported - e.g. import { IvContent } from './../iv/types';



/**
 * Fragments: projecting content without creating any extra element
 * In the previous example the $content is projected in the .message div - but in some cases
 * we don't want to create a specific element to project content. This is where
 * ivy fragments should be used. The purpose of fragments (like in jsx) is to
 * group multiple nodes together (e.g. elements, text or components). Ivy fragments
 * are written as special elements with '!' as name:
 * <!> # Fragment content # </!>
 */
const messageSample2 = template(`() => {
    <*message2 type="warning">
        <span> # TDD is good for you :-) # </span>
    </>
}`);

const message2 = template(`(type:string, $content:IvContent) => {
    # Important message ({type}): #
    <! @content /> // equivalent to <! @content={$content} />
    # ! #
}`);

messageSample2().attach(document.body).render();
// render result:
// Important message (warning): <span> TDD is good for you :-) </span> !


/**
 * Components with multiple named contents
 * There are cases where we want to have multiple content nodes. This is why ivy supports
 * another special node type named Param Nodes.
 * Param nodes allow are virtual nodes that can hold parameters (and $content) and that 
 * are considered as parameters by they parent. They use the specific '.' prefix to
 * be differentiated from elements and components
 */
const sectionSample = template(`() => {
    <*section>
        <.header>
            <span class="my_title"> # Warning # </span>
        </>
        <div class="my_content">
            # Important message to the world #
        </>
    </>
}`);

const section = template(`($content:IvContent, header?:IvContent, footer?:IvContent) => {
    <div class="section">
        if (header) {
            <div class="header" @content={header}/>
        }
        <! @content />
        if (footer) {
            <div class="footer" @content={footer}/>
        }
    </>
}`);


/**
 * Param nodes with parameters
 * As previously mentioned param nodes can also be used to hold parameters instead of 
 * $content only. For this, parameters need to be defined as Data objects
 */
const section2Sample = template(`() => {
    <*section2>
        <.header type="warning"> # Warning # </>
        # Your tests don't pass #
    </>
}`);

@Data class Section2Header {
    type?: "warning" | "info" = "info";
    $content: IvContent;
}
const section2 = template(`($content:IvContent, header?:Section2Header) => {
    <div class="section">
        if (header) {
            <div class={"header "+header.type} @content={header}/>
        }
        <! @content />
    </>
}`);



/** 
 * Param nodes inside param nodes
 * Param nodes can also be associated to other param nodes to create complex param
 * structures
 */
const section3Sample = template(`() => {
    <*section3>
        <.header type="warning"> 
            <.buttons position="right"> 
                <a href="http://"> # ... # </a>
            </>
            # Warning # 
        </>
        # Your tests don't pass #
    </>
}`);

@Data class Section3Buttons {
    position: string;
    $content: IvContent;
}
@Data class Section3Header {
    type?: "warning" | "info" = "info";
    $content: IvContent;
    buttons: Section3Buttons
}
const section3 = template(`($content:IvContent, header?:Section3Header) => {
    <div class="section">
        if (header) {
            let bt = header.buttons;
            <div class={"header "+header.type}>
                if (bt) {
                    <div class={"bt "+bt.position} @content={bt.$content} />
                }
                <! @content={header}/>
            </>
        }
        <! @content />
    </>
}`);


/**
 * List of param nodes can also be used to describe collections of parameters
 * such as items in a list
 */
const accordionSample = template(`() => {
    <*accordion>
        <.section id="a"> 
            <.header> # Section A # </>
            # Content A #
        </>
        <.section id="b"> 
            <.header> # Section A # </>
            # Content A #
        </>
    </>
}`);

/**
 * In this case the param node holding the list of param nodes must be named with
 * the 'List' suffix - e.g. sectionList in this example
 */

@Data class AccSection {
    id: string;
    $content: IvContent;
    header?: IvContent; // could be also a sub Data object with a $content property
}
const accordion = template(`(sectionList: AccSection[]) => {
    <div class="accordion">
        for (section of sectionList) {
            <div class="acc_section">
                if (section.header) {
                    <div class="header" @content={section.header}/>
                }
                <! @content={section.$content}/>
            </>
        }
    </>
}`);

/**
 * List of parameters of different type
 * E.g. List with items and separators
 */
const listSample = template(`() => {
    <*list>
        <.item key="a"> # Item A # </>
        <.item key="b"> # Item B # </>
        <.separator/>
        <.item key="b"> # Item C # </>
    </>
}`);

/**
 * This use case is solved with another specific property: $childParams: IvCollection
 * Like for $content, $childParams will be automatically injected as a parameter
 */

@Data class ListItem {
    key: string;
    $content: IvContent;
}
@Data class ListSeparator { }
const list = template(`(itemList: ListItem[], separatorList:ListSeparator[], $childParams: IvCollection) => {
    <ol>
        let nbrOfItems = $childParams.length;
        $childParams.forEach((item, name, idx) => {
            if (name === "item") {
                <li class="item" @content={item.$content}/>
            } else if (name === "separator") {
                <li class="separator"/>
            }
        });
    </>
}`);

/**
 * Template API and Change detection
 * As explained in the code generation mental model, the template arguments are automatically
 * gathered in a single object named api. There are 2 reasons for this
 * - first, unlike JS functions template don't use positional arguments (but named parameters)
 * - second, Ivy uses special objects that can be watched - which allows ivy to automatically
 * re-render a template when its arguments have changed. This is done by default asynchronously
 * so that multiple changes result in one single render.
 * As a side note, the template api can be explicitly used to describe the template
 * arguments. In this case a single api param should be used and the api type must refer
 * to a @API class (@API classes are a specialized version of @Data objects)
 */
@API class HelloABC {
    a: string;
    b: string;
    c: string;
}
const helloABC = template(`($: HelloABC) => {
    # Hello {$.a}, {$.b} and {$.c} #
}`);

// --------------------------------------------------------------------------------------------------------------------------
// # Rich Components

/**
 * Controllers
 * = ability to provide private state and methods on top of the public API
 * Changes to the controller state (i.e. properties) or to the controller api will automatically 
 * trigger a new render()
 * Note: when a controller is defined, the template params must be defined through a api property on the controller class.
 */

@API class Section4 {
    header?: IvContent;
    expanded: boolean = true;
    $content: IvContent;
}
@Controller class Section4Ctl {
    api: Section4;
    internalCounter = 0;    // some private state (not on public api)

    increment() { // private method (not on public api)
        this.internalCounter++;
    }
}
const section4 = template(`($: Section4Ctl) => {
    let api = $.api;
    <div class="section">
        <div class="header" @onclick={=>$.increment()}>
            if (!api.header) {
                # ... # 
            } else {
                <! @content={api.header}/>
            }
        </>
        # Internal counter: {$.internalCounter} #
        <! @content={api.$content} />
    </>
}`);

const section4Sample = template(`() => {
    <*section4>
        <.header> # Hello # </>
        <div class="the_content"> # Section content # <div>
    </>
}`);


/**
 * Life cycle hooks: $init / $beforeRender / $afterRender / $dispose
 * $init: controller method called when all params have been set
 * $beforeRender: controller method called before the template render function is called 
 * $afterRender: controller method called after the render function has been called
 *     -  api params or internal state changes occurring in $beforeRender or $afterRender will not trigger new render()
 *     - $beforeRender and $afterRender can query template elements or sub-components (cf. labels) - while query are forbidden
 *         during the render() process (this is to prevent queries to lead to state change without triggering new render)
 * $dispose: called when the component is being deleted;
 */
@API class Section5 {
    title: string;
    $content: IvContent;
}
@Controller class Section5Ctl {
    api: Section5;

    $init() {
        // here api.title has been set (if provided)
    }

    $beforeRender() {
        // called before render :-)
    }

    $afterRender() {
        // after render
    }

    $dispose() {
        // this is the end...
    }
}
const section5 = template(`($:Section5Ctl) => {
    // ...
}`);

/**
 * Exposing methods
 * Public methods can be exposed on the api object. However they cannot be defined on the api itself as they may need
 * access to controller properties - this is why public methods must be defined in the controller $init method
 * Note: Those public methods are usually accessed through labels (cf. labels section) - but they can also be accessed
 * from the root template instance
 */
@API class Section6 {
    title: string;
    $content: IvContent;
    expand: () => void;
    close: () => void;
}
@Controller class Section6Ctl {
    api: Section6;
    expanded = true;

    $init() {
        this.api.expand = () => {
            this.expanded = true;
        }
        this.api.close = () => {
            this.expanded = false;
        }
    }

}
const section6 = template(`($:Section6Ctl) => {
    <div class="section6">
        <div class="header" @onclick={=>$.expanded=!$.expanded}> #{title}# </div>
        if ($.expanded) {
            <! @content={$.api.$content} />
        }
    </>
}`);
let s6 = section6().attach(document.body).render({ title: "Hi" });
s6.api.close();

/**
 * Exposing custom events
 * Template (w/ or w/p controllers) can expose events through the IvEventEmitter class;
 * Events have to be defined on the api class and must follow the xxxxEmitter naming convention - where xxxx is the event name (e.g. clickEmitter)
 */

@API class Msg {
    text: string = "";
    clickEmitter: IvEventEmitter; // or IvCancelableEventEmitter if the events needs to be cancellable
}
const msg = template(`($:Msg) => {
    <div class="msg" @onclick={=>$.emit("some data")}>
        # {text} #
    </>
}`);

