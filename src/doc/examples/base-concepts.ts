import { NavControllerLoadFunction } from './../../iv/router';
import { $template } from "../../iv";
import w from '../widgets';

export const hello = $template`() => {
    <!cdata @@md>
    # Hello World 
    
    This series of examples is designed to progressively introduce the different ivy concepts.
    - the first part introduces ivy **base concepts** such as template functions and core syntax elements
    - the second part explains the main principles behind ivy **reactivity** (i.e. how ivy tracks changes and updates the HTML DOM)
    - the next part introduces rich **components** that associate templates with controllers to keep private states 
    - finally the last part explains how to develop simple **forms**
    </!cdata>
    <*w.notions>
        <.notion name="XJS template functions"> XJS basics: template, elements and text nodes </>
        <.notion name="template arguments"> create template parameters </>
        <.notion name="template instantiation"> create and render a template instance </>
        <.notion name="mental model & code generation"> understand how ivy works and how to debug </>
    </>
    <*w.demo src="hello" height=130/>
    <*w.code @@extract="hello/hello.ts#all" indicators="bottom"/>
    <!cdata @@md>
    This *Hello World* example is one of the most simple application that can be developed with ivy.
    
    As you can see, the code is composed of 
    - a template function (cf. *hello* const) that describes how the template should be rendered
    - and a piece of code to instantiate the template, insert it into the HTML body and render it with the *name* variable.
    
    The **template function** is described in a template string tagged with the *$template* function. 
    The reasons for this are multiple:
    - one of the first idea behind ivy was to use a DSL (Domain-Specific-Language) that could easily mix the JavaScript and 
    XML mental models (like JSX) without requiring a specific extension (unlike JSX): this is why *JavaScript template strings* 
    have been used as they allow to write ivy templates in normal typescript files (with the *.ts* extension)
    - tagged templates also allow to correctly type the variable the template is stored into. 
    As we will see below, the *$template* function doesn't return a string but a template factory.
    - and finally, the *$template* tag function allows to easily trigger the custom syntax highlighter developed for vs code 
    (and that is also used for this documentation)
    
    Having said that, a first look at the template code should remind you of the JSX syntax.
    This is actually completely intended as the syntax behind ivy (aka. XJS) 
    was designed as an evolution of JSX.

    Similarly to JSX, ivy compiles the XJS templates into JavaScript code at build time. However, 
    there is a **fundamental difference between JSX and XJS: in XJS every instructions are compiled 
    as JavaScript statements**, whereas in JSX elements are compiled as JavaScript expressions. In practice this means
    that **an ivy template can be read as a JavaScript function**.
    
    As shown in the next code sample:
    - every element creation (e.g. \<div>) can be seen as a call to a *createElt* function
    - every text node can be seen as a call to an *addText* function
    - every element closing tag (e.g. \</div>) can be seen as a call to a *closeElt* function
    
    This brings the following benefits:
    - ivy can implement an *incremental-dom* like algorithm which is substantially more memory efficient that JSX-based comparison algorithms
    - ivy can use standard JavaScript control statements (e.g. for loops, if blocks) as well as local variables
    - ivy debugging is very simple, as developers simply need to put a *console.log* statement to see internal variables during rendering time
    (cf. *$log* instruction).
    
    </!cdata>
    
    <*w.code @@extract="hello/pseudocode.ts#mental-model" indicators="top"/>
    <!cdata @@md>
    Last but not least, the *$template* function returns a *template factory*, 
    i.e. a function that creates a template instance that can then be used to interact with the HTML DOM.
    In practice this way of instantiating a template in only used to bootstrap the root template, then
    templates can simply be *called* from another template, as shown in the next examples.
    </!cdata>
    <*w.code @@extract="hello/hello2.ts#instantiation" indicators="top"/>
}`;


export const expressions = $template`() => {
    <!cdata @@md>
    # Expressions & properties
    </!cdata>
    <*w.notions>
        <.notion name="binding expressions"> bind JS values to DOM elements and text nodes </>
        <.notion name="attributes vs. properties"> target DOM attributes or properties </>
        <.notion name="setting or removing attributes"> e.g. to enable or disable an input or button </>
        <.notion name="one-time bindings"> avoid recalculating expressions that don't change (e.g. translation values) </>
        <.notion name="manual re-rendering"> to synchronously (re-)render a template instance </>
    </>
    <*w.demo src="expressions" height=180/>
    <!cdata @@md>
    One of the great features of template engines is their ability to bind expressions to the HTML DOM.
    In ivy this is done with the **{exp}** syntax that allows to embed any JS expression. Of course, 
    as ivy transforms the template into a JS function the *exp* symbol has to be available in the function
    block scope, which means that
    - it is either defined in the module scope (e.g. through a global variable or an *import*)
    - or through a template parameter or local variable.

    Here is for instance how binding expressions can be used on element attributes:
    </!cdata>
    <*w.code @@extract="expressions/expressions.ts#attributes"/>
    <!cdata @@md>
    **Note:** when the expression returns **undefined**, the attribute is **removed from the DOM**.

    Of course it is better to know the data structure to understand this example (and this is why ivy support types
    in the template param definition - even though there are not used in this example):
    </!cdata>
    <*w.code @@extract="expressions/expressions.ts#data"/>
    <!cdata @@md>
    Expressions can also be used on text nodes:
    </!cdata>
    <*w.code @@extract="expressions/expressions.ts#text"/>
    <!cdata @@md>
    In this example we can see that expressions can call functions defined in the current JavaScript module 
    (cf. full code at the end of this page):
    </!cdata>
    <*w.code @@extract="expressions/expressions.ts#process-function"/>

    <!cdata @@md>
    On top of attributes, ivy also supports the possibility to target DOM element properties by using the
    **[propertyName]** syntax.

    If you are not aware of the difference between attributes and properties, it is actually quite simple:
    - attributes are the standard XML parameters that are used in the HTML documents (e.g. *class="xyz"* )
    - whereas properties are the parameters that can be accessed dynamically in JavaScript through the *elt.property* 
    or *elt["property"]* accessors (e.g. *elt.className="xyz"* or *elt["className"]="xyz"*)

    Attributes are always strings, whereas properties can be of any JavaScript type:
    </!cdata>
    <*w.code @@extract="expressions/expressions.ts#properties"/>
    <!cdata @@md>
    Last but not least, it is sometimes very interesting to define bindings that should only be interpreted once.
    In this case, the **::** prefix should be used at the beginning of the expressions (of course this works
    for any expressions)
    </!cdata>
    <*w.code @@extract="expressions/expressions.ts#one-time"/>
    <!cdata @@md>
    Full code sample:
    </!cdata>
    <*w.code @@extract="expressions/expressions.ts#start>>instantiation"/>
}`;

export const subTemplates = $template`() => {
    <!cdata @@md>
    # Sub-templates
    </!cdata>
    <*w.notions>
        <.notion name="sub-templates"> calling a template from another template </>
        <.notion name="arguments default values"> to specify the default value of a template parameter</>
    </>
    <*w.demo src="subtemplates" height=110/>
    <!cdata @@md>
    This example shows how a given template can be called from another template.

    As you can see in the code below, calling a template in ivy is very similar to displaying an HTML element,
    with the difference that the template name must be prefixed with the **\*** symbol.

    Note: the sub-template name is considered as a local JavaScript reference and as such it must be available
    in the template function scope (e.g. from the global context, an module import or a template param).
    </!cdata>
    <*w.code @@extract="subtemplates/subtemplates.ts#main"/>
    <!cdata @@md>
    
    As you can imagine *greet* references another template defined in the same JS module.

    </!cdata>
    <*w.code @@extract="subtemplates/subtemplates.ts#greet"/>
    <!cdata @@md>
    
    In this case, *greet* also uses another sub-template defined in another module (*lib.ts* - 
    cf. full sample below) which is imported as *lib*, this is why *text* has to be referenced as *lib.text*.

    Note: if *text* was imported individually, then *<\*text\>* could have been used.

    </!cdata>
    <*w.code @@extract="subtemplates/lib.ts#text"/>
    <!cdata @@md>
    Full sample:
    </!cdata>
    <*w.code @@extract="subtemplates/subtemplates.ts#start>>instantiation"/>
}`;

export const loops = $template`() => {
    <!cdata @@md>
    # Variables, loops and conditions
    </!cdata>
    <*w.notions>
        <.notion name="control statements"> using the !$if, !$for and !$each() statements  to control template rendering output </>
        <.notion name="local variables"> with !$let </> 
        <.notion name="executing JS expressions"> with !$exec </> 
        <.notion name="debugging"> with !$log() </> 
        <.notion name="array arguments naming convention"> e.g. xxxList </> 
    </>
    <*w.demo src="loops" height=210/>
    <!cdata @@md>
    This example demonstrates how to use the different JavaScript statements that are available in ivy.

    The first column is built as an independent template (*greetings1*) that loops over an array of strings:
    </!cdata>
    <*w.code @@extract="loops/loops.ts#loop1"/>
    <!cdata @@md>
    
    As you can see, the loop is done thanks to a custom statement named *$each()*. This statement uses
    a standard JS function signature that takes 2 arguments:
    - first, an expression returning a JS Array to iterate over
    - second, a function to call at each iteration

    The function arguments are the following:
    + the current item identifier
    + the item index in the Array
    + an indicator telling if the item is last in the list

    This example also shows how to display conditional blocks thanks to the **$if** statement (same signature 
    as in JavaScript).

    Note: the *$if* statement is also used in the *row* template to display an *\<hr/>* element every 2 items:
    </!cdata>
    <*w.code @@extract="loops/loops.ts#row"/>
    <!cdata @@md>
    That said, the second column in the example shows another way of performing loops
    with the $for statement (same signature as in JavaScript):
    </!cdata>
    <*w.code @@extract="loops/loops.ts#loop2"/>
    <!cdata @@md>
    This example also shows how to:
    - create local variables thanks to the *$let* statement
    - execute JS expressions without generating any text output thanks to the *$exec* statement
    - loc values in the console with the *$log()* statement

    Full sample:
    </!cdata>
    <*w.code @@extract="loops/loops.ts#all>>instantiation"/>
}`;

export const section = $template`() => {
    <!cdata @@md>
    # Templates with content elements
    </!cdata>
    <*w.notions>
        <.notion name="container templates"> i.e. template that accept content as argument </>
        <.notion name="@content decorator"> to re-inject some content passed as argument </>
        <.notion name="XJS fragment nodes"> to group XJS nodes without creating any DOM container elements </>
        <.notion name="$content parameter"> i.e. the default template content </>
        <.notion name="simple param nodes"> to accept multiple content values </>
    </>
    <*w.demo src="section" height=460/>
    <!cdata @@md>
    This example demonstrates how templates can be used as *containers* and accept *content nodes*
    as input
    - on the left side, the example shows a simple group template that re-project its content inside
    a frame with a title
    - on the right side, the example shows an evolution of the group template that can accept two
    different pieces of content (the default content that is displayed in the frame, and content 
    for the title area)

    Before jumping into the implementation details, here is how a simple container template can 
    be used:
    </!cdata>
    <*w.code @@extract="section/section.ts#groups"/>
    <!cdata @@md>
    As you can see, usage is very similar to any HTML element.

    Now let's have a look at the implementation. From the *group* template perspective, the
    HTML *default* content is simply considered as a template parameter that is named **$content**
    (this is an ivy reserved keyword). If you wish to have it typed, you must use the IvContent
    type provided by ivy.

    Then you must tell ivy where the content should be projected, and for this you need to use
    the **@content** built-in decorator. Decorators are explained in more details in other
    examples, but for the time being, you can simply consider them as special parameters with an **@ prefix**

    Syntactically, there are 2 ways to use *@content*:
    - either with a value - e.g. *@content={someContent}* (you will see below how to have named contents)
    - or with no values - e.g. *@content* - in which case it is equivalent to *@content={$content}*

    Finally, *@content* needs to sit on a node that will contain the projected content. Here again
    we have 2 options:
    - either use an HTML element - e.g. *\<div @content\\/>*
    - or use an **ivy fragment** - e.g. *\<! @content\/\>* - Ivy fragments are virtual containers
    that group nodes without rendering any container element in the HTML output. They have no name
    but are identified with the ! prefix:

    </!cdata>
    <*w.code @@extract="section/section.ts#group"/>
    <!cdata @@md>
    Next example shows how a template can have multiple content nodes. Of course, as there can only
    be one unnamed (default) content, other content groups have to be named.

    This where ivy introduces a specific kind of nodes called **param nodes**. As their name tells,
    param nodes are XML elements that hold param values. They can be differentiated from other
    elements thanks to their **.** prefix.

    Note: if you are familiar with HTML *\<slot/>* elements, you may wonder why ivy doesn't use them?
    The reason is actually that param nodes are much more powerful than slots as they can hold
    both params and content and also sub- param nodes (as shown in examples in the components section)
    </!cdata>
    <*w.code @@extract="section/section.ts#sections"/>
    <!cdata @@md>
    As you can see, using the *section* template is very similar to using the *group* template,
    the only difference being the \<.header\> and \<.footer\> param nodes.

    On the implementation side, *section* is also very similar to *group*. As you can see, *header*
    and *footer* are simply defined as new *IvContent* template arguments that can be projected
    with the *@content* decorator:
    </!cdata>
    <*w.code @@extract="section/section.ts#section"/>
}`;

export const events = $template`() => {
    <!cdata @@md>
    # Event handlers
    </!cdata>
    <*w.notions>
        <.notion name="event handlers decorators"> to trigger actions on DOM events </>
        <.notion name="function expressions"> to pass a function as an expression value - e.g *!{e=!>func(e,x,y)!}* </>
        <.notion name="function expressions shortcut"> to pass a 0 arguments function as an expression - e.g *!{=!>func(x,y)!}*  </>
        <.notion name="event handlers options"> to pass to the DOM addEventListener() method </>
        <.notion name="$api parameter"> to retrieve the object that holds all template parameters </>
    </>
    <*w.demo src="events" height=130/>
    <!cdata @@md>
    Until now, all examples were static. Thanks to event handlers we will now have the possibility
    to make things more dynamic. 
    
    This example demonstrates several ways of handling events:
    - if you click on one of the "-" or "+" button, the template counter will be updated
    - if you double click on the number, the counter will be reset
    - if you focus the number and press a number key, the counter will take the key value

    Let's first have a look at the "-" button code:
    </!cdata>
    <*w.code @@extract="events/events.ts#handler2"/>
    <!cdata @@md>
    As you can see, like for *@content*, event handlers are defined with built-in decorators
    that are prefixed with "on" (like in HTML). The default value that should be passed
    to this decorator is a function expression that will be executed when the event occurs
    (like in JSX). This function will be called with the HTML event argument (not used in this
    case).

    Having said that, you may wonder what is this **$api** identifier is for? Actually, like *$content*,
    **$api** is a special parameter that can be used to retrieve the API object used by the ivy
    template to hold all template parameters.

    Behind the scene ivy is able to observe all changes performed on this API object, this is why 
    updating it will automatically trigger an (asynchronous) template re-rendering (aka. refresh): 
    </!cdata>
    <*w.code @@extract="events/events.ts#counter>>handler2"/>
    <!cdata @@md>
    At the top of the previous extract, the example shows how to call an event handler function and
    pass the HTML event as argument. As $api is a JavaScript object, it can also be passed as argument 
    to the handler function (if need be):
    </!cdata>
    <*w.code @@extract="events/events.ts#handleKey"/>
    <!cdata @@md>
    As the event handler value can be any function (like in React), you can also use Function.bind
    to pass some arguments as *this*:
    </!cdata>
    <*w.code @@extract="events/events.ts#handler3"/>
    <!cdata @@md>
    ...that will call:
    </!cdata>
    <*w.code @@extract="events/events.ts#resetCounter"/>
    <!cdata @@md>
    Having said that, ivy also supports a more advanced syntax to use all [addEventListener()][el] 
    options. In this case, you will have to use the multi-argument decorator
    syntax, which groups all decorator params into rounded brackets:

    [el]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    </!cdata>
    <*w.code @@extract="events/events.ts#handler4"/>
    <!cdata @@md>
    Event handlers decorators support the following arguments:
    - **listener** the listener function (default param)
    - **options** the addEventListener [options][el]

    Note: the listener parm in this last sample uses a **syntax shortcut for function expressions**.
    I you don't need any event parameter, the function expression can be written as *{=>func()}*
    instead of *{()=>func()}*

    [el]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    Full example:
    </!cdata>
    <*w.code @@extract="events/events.ts#import>>instantiation"/>
}`;

export const pages = $template`() => {
    <!cdata @@md>
    # Page navigation
    </!cdata>
    <*w.notions>
        <.notion name="Using dynamic component references"> to implement navigation </>
    </>
    <*w.demo src="pages" height=220/>
    <!cdata @@md>
    This example shows how a template can be dynamically changed by another template: if you
    click on the *page A* button, the bottom part will display the *pageA* template, whereas
    clicking on *page B* will display the *pageB* template. On top of that, if you click on
    the + button, you will increment an internal counter that is displayed in both pages:
    </!cdata>
    <*w.code @@extract="pages/pages.ts#pages"/>
    <!cdata @@md>
    As these 2 templates have the same API, they can be dynamically exchanged.

    To do so, you have to remember that the template name used in a template call is a local
    reference. As such, it can be passed as any other template argument, and can also be 
    changed dynamically:
    </!cdata>
    <*w.code @@extract="pages/pages.ts#main"/>
}`;