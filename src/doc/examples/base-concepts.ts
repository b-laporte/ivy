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
    
    Having said that, the first reaction that readers may have when looking at the template code is that it 
    looks like JSX. And indeed, this is completely intended. Actually, the syntax behind ivy (aka. XJS)
    was designed as a refinement of JSX.
    
    However, even if they look similar, XJS fundamentally differs from JSX as it considers every instructions
    as JavaScript statements (whereas a JSX block is considered as an expression). In practice this means
    that **an ivy template can be read as a JavaScript function**.
    
    As shown in the next code sample:
    - every element creation (e.g. \<div>) can be seen as a call to a *createElt* function
    - every text node can be seen as a call to an *addText* function
    - every element closing tag (e.g. \</div>) can be seen as a call to a *closeElt* function
    
    This brings the following benefits:
    - ivy can implement an *incremental-dom* like algorithm which is substantially more memory efficient that JSX-based comparison algorithms
    - ivy can use standard JavaScript control statements (e.g. for loops, if blocks) as well as local variables
    - ivy debugging is very simple, as developers simply need to put a *console.log* statement to see internal variables during rendering time
    (cf. *!$log* instruction).
    
    </!cdata>
    
    <*w.code @@extract="hello/pseudocode.ts#mental-model" indicators="top"/>
    <!cdata @@md>
    
    Last but not least, the *$template* function returns a *template factory*, 
    i.e. a function that creates a template instance that can be used to interact with the template.
    In practice this way of instantiating a template in only used to bootstrap the root template, then
    templates can simply be *called* from another template, as shown in the next examples.
    
    
    </!cdata>
    <*w.code @@extract="hello/hello2.ts#instantiation" indicators="top"/>
    
}`;


export const expressions = $template`() => {
    <!cdata @@md>
    # Expressions and properties
    </!cdata>
    <*w.notions>
        <.notion name="binding expressions"> bind JS values to DOM elements and text nodes </>
        <.notion name="attributes vs. properties"> target DOM attributes or properties </>
        <.notion name="setting or removing attributes"> e.g. to enable or disable an input or button </>
        <.notion name="one-time bindings"> avoid recalculating expressions that don't change (e.g. translation values) </>
        <.notion name="manual re-rendering"> to synchronously (re-)render a template instance </>
    </>
    <*w.code @@extract="expressions/expressions.ts#template"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="expressions/expressions.ts#process-function"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="expressions/expressions.ts#instantiation"/>
    <div class="text">
        <p>
            ...
        </>
    </div>
    <*w.code @@extract="expressions/expressions.ts#update"/>
}`;