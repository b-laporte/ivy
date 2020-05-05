import { NavControllerLoadFunction } from './../../iv/router';
import { before } from 'mocha';
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