import { $template } from '../../iv';
import w from '../widgets';

export const innerHTML = $template`() => {
    <!cdata @@md>
    # Injecting HTML content
    Applications often need to display HTML content sent by the server. In this case the simplest
    way to display this content would be to bind it to the [innerHTML] property of a div 
    element. The problem with this method is that it is an open door to code injection and it
    is not considered safe by current security standards.

    This is why **ivy prevents the usage of innerHTML** and recommends other methods described
    in the next examples. 
    
    Having said that, if you still wish to use innerHTML, ivy exposes 
    an **@unsafeInnerHTML** decorator that can be used for this purpose.
    This is what is demonstrated below:
    </!cdata>
    <*w.notions>
        <.notion name="@unsafeInnerHTML"> to (unsafely) inject an html string into an element </>
    </>
    <*w.demo src="innerHTML" height=200/>
    <!cdata @@md>
    This example uses an input \<textarea> and an output \<div> bound to the same HTML data. 
    If you edit the text in the textarea, then the output content automatically changes.

    Here is how to use **@unsafeInnerHTML**:
    </!cdata>
    <*w.code @@extract="innerHTML/innerHTML.ts#main"/>
    <!cdata @@md>
    Of course, @unsafeInnerHTML is not a built-in decorator and it needs to be explicitly imported:
    </!cdata>
    <*w.code @@extract="innerHTML/innerHTML.ts#innerHTML-import"/>
}`;

export const fragment1 = $template`() => {
    <!cdata @@md>
    # $fragment strings
    </!cdata>
    <*w.notions>
        <.notion name="$fragment template strings"> to define safe HTML fragments that can be dynamically downloaded & rendered </>
        <.notion name="@fragment"> to safely inject !$fragment content in an element </>
        <.notion name="@fragment context"> to specify which references are accessible to !$fragments </>
    </>
    <!cdata @@md="top-desc">
    This example shows how to use **$fragment** template strings to define safe content that will
    be dynamically parsed and interpreted (i.e. in the browser) without being compiled at build time.

    In the example below you will be able to edit an XJS fragment and inject it into a div created by 
    a traditional **$template** instance. 
    </!cdata>
    <*w.demo src="fragment1" height=240/>
    <*w.code @@extract="fragment1/fragment1.ts#main"/>
    <!cdata @@md>
    As you can see, the example is composed of 2 parts:
    - the $fragment definition
    - and the $fragment injection

    ## $fragment definition
    $fragment strings are defined in a similar manner as $template strings, with a few differences:
    - $template is replaced by $fragment (easy)
    - the $fragment string corresponds to an HTML fragment and as such is not parametric, this is 
    why it doesn't start with function arguments (like $template strings) but with content 
    elements or text nodes
    - $fragment strings can contain references to external data and components, but this references 
    will have to be gathered into a **context** object that will have to be passed when injecting 
    the fragment into the DOM (this is to prevent fragments from using unauthorized data as fragments
    are designed bo be safely interpreted without exposing vulnerabilities to code injections).
    - similarly, security restrictions prevent using the complete range of JavaScript expressions. 
    This is why $fragment expressions are currently limited to JS identifier paths (e.g. *a.b.c* 
    where *a* is an object provided by the **fragment context**)
    
    ## $fragment injection

    $fragments can be injected into the HTML DOM thanks to the **@fragment** decorator. This decorator 
    takes two parameters:
    - **value**: the reference to the object returned by *$fragment*. If the $fragment string is 
    retrieved from the server (so as JS string), then it should be transformed in to an IvFragment
    by calling $fragment: *$fragment\`$\{myString\}\`*
    - **context**: the context object, which is a simple hashmap containing the references to the 
    data and components that should be accessible to the $fragment

    Note: the *IvFragment* objects expose their string templates through the *template* 
    read/write property. This is why the textarea content is bound to 
    *content.template* in this example.
    </!cdata>
    <*w.code @@extract="fragment1/fragment1.ts#context"/>
    <!cdata @@md>
    Of course, this means that *alert* is defined in the context JS scope (in this case, it 
    is defined in the same file):
    </!cdata>
    <*w.code @@extract="fragment1/fragment1.ts#alert"/>
    <!cdata @@md>
    As @fragment depends on the xjs parser and ivy code generator, it cannot be implemented as 
    a built-in decorator - this is why it needs to be explicitly imported:
    </!cdata>
    <*w.code @@extract="fragment1/fragment1.ts#fragment-import"/>
}`;

export const fragment2 = $template`() => {
    <!cdata @@md>
    # special characters and cdata sections
    </!cdata>
    <*w.notions>
        <.notion name="special characters" />
        <.notion name="cdata sections"/>
    </>
    <*w.demo src="fragment2" height=200/>
    <!cdata @@md>
    This example shows how the **@fragment value** can be dynamically changed. It also 
    shows how to use the XJS special characters (which are the same for $template and 
    $fragment strings).

    As you can see in the code below, XJS uses the **exclamation mark** to escape characters (XJS doesn't 
    use the traditional \\ sign to avoid colliding with the backtick string encoding). The 
    complete list of special characters is available [here][xjsSC].

    [xjsSC]: https://github.com/AmadeusITGroup/xjs/blob/master/docs/xjs.md#encoding--special-characters
    </!cdata>
    <*w.code @@extract="fragment2/fragment2.ts#content"/>
    <!cdata @@md>
    You will note that *contentC* uses a special kind of node called **cdata**. This 
    special node allows to create text nodes (aka. *content data* nodes) that don't follow 
    the same parsing rules as normal text nodes.

    Indeed cdata sections allow to write any kind of text with no need for character escaping.
    All white spaces are also preserved in cdata sections, whereas they are collapsed in normal 
    text nodes. Actually, the only thing that can be escaped in a cdata section is the 
    *end of cdata* symbol (in case you need to display it in a text node).

    Apart from that, all fragments share the same context - as it should be the case in most 
    applications. Indeed the goal of the context is to expose a safe API, and as such 
    there is usually no need to create a different context for each fragment:
    </!cdata>
    <*w.code @@extract="fragment2/fragment2.ts#alert>>context"/>
    <!cdata @@md>
    And finally, here is how everything is tight together:
    </!cdata>
    <*w.code @@extract="fragment2/fragment2.ts#main"/>
}`;
