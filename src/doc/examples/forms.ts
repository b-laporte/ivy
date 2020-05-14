import { $template } from '../../iv';
import w from '../widgets';


export const forms1 = $template`() => {
    <!cdata @@md>
    # Input bindings
    </!cdata>
    <*w.notions>
        <.notion name="@value decorator"> to bind input and textareas to data models </>
        <.notion name="template uid"> to create unique ids/labels </>
    </>
    <!cdata @@md="top-desc">
    This examples shows how to easily read and set \<input> elements values and build simple 
    forms.
    </!cdata>
    <*w.demo src="forms1" height=290/>
    <!cdata @@md>
    As you can see, the example shows how to build a simple form to edit car information. 
    In this particular case, we have actually 2 instances of the same form bound to the same data model.
    This is why editing one form immediately updates the second one.

    Like for any template, everything starts from the data model. Here is the one used for these forms:
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#data-model"/>
    <!cdata @@md>
    If you ever worked with \<input> elements, you know that things can quickly become complicated.
    Indeed, \<input> elements should be used slightly differently depending on their type (e.g. the 
    value attribute is associated to the text value for a text input, whereas it is associated to 
    the input code for a radio type - without mentioning that radio inputs should be bound with 
    a same unique name...).

    To be make this simpler, most template engines decided to hide this complexity in the framework
    and provide some kind of unified API. The problem with this approach is that there are many 
    exceptions that need to be implemented, maintained, documented and then somehow learned by the 
    developers (without mentioning the risk to limit the framework capabilities).

    This is why **ivy approach is different**. 
    One of ivy's core design rule is to **keep a clear relationship with what the developer writes 
    and the underneath DOM operations** (e.g. \<div foo="bar"\> means *call [setAttribute("foo", "bar")][sa] 
    on the div*), almost without any exceptions (the only exception being for *innerHTML* 
    that is disabled for security reasons - cf. next example in the *content* section).

    That being, it doesn't mean that ivy cannot help you. That's actually what decorators are meant for.
    In this particular case, ivy provides an **@value** decorator that allows to support 
    **2-way bindings** on most frequently-used \<input> elements:

    [sa]: https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#form"/>
    <!cdata @@md>
    As you can see, the *@value* decorator can be used in a similar manner, whatever the input 
    type. Note that for 2-way binding to be effective, you have to use 2-way binding expressions 
    that start with the **= sign** (like spreadsheet formula) and that can only be used on 
    *@io* params (cf. previous examples).

    You can also note that radio buttons don't need to be bound with a unique name any more as the 
    2-way data binding will automatically ensure that one button is selected (provided that the 
    same code is not used twice, of course). That said, it is still possible to add a unique 
    name if need be. For this, ivy exposes a **unique identifier** on each template instance (that 
    can be injected through the *$template* argument, as explained in previous examples).

    The last thing to know about @value is that it is not a built-in decorator, and so needs 
    to be imported explicitly:
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#value-import"/>
    <!cdata @@md>
    To make the example complete, here is finally the root template used in this example:
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#main"/>
}`;

export const forms2 = $template`() => {
    <!cdata @@md>
    # Input binding options
    </!cdata>
    <*w.notions>
        <.notion name="@value debounce parameter"> to delay change events and prevent bursting </>
        <.notion name="@value events"> to specify which events should be used (on top of "change") </>
    </>
    <!cdata @@md="top-desc">
    This examples showcases some extra parameters that can be used with the **@value** decorator:
    - **debounce** to introduce a small delay between the input and the actual push to the data model
    (this is particularly helpful on text nodes)
    - **events** that allow to specify which events should be listen-to to trigger the 2-way binding 
    synchronization (by default @value listens to the *input* event only):
    </!cdata>
    <*w.demo src="forms2" height=290/>
    <!cdata @@md>
    As you can see, changes performed in the left form are now synchronized with a little delay 
    to the right form. This is due to the **debounce** value that tells **@value** to buffer the 
    user events in order to limit the number of synchronization operations (e.g. if you type 
    very fast in the text field, the synchronization will only happen when you stop typing for 
    250ms).

    Like for any other decorators, the extra-parameters have to be passed by grouping them into
    rounded brackets (e.g. *@value(data={=data.name} debounce={o.debounce})*):
    </!cdata>
    <*w.code @@extract="forms2/forms2.ts#form"/>
    <!cdata @@md>
    Apart from that, the rest of the example is similar to the previous example.

    Here is the full code:
    </!cdata>
    <*w.code @@extract="forms2/forms2.ts#imports>>main"/>
}`;


export const select = $template`() => {
    <!cdata @@md>
    # Textarea and Select
    </!cdata>
    <*w.notions>
        <.notion name="@value for textarea and select elements"/>
    </>
    <*w.demo src="select" height=290/>
    <!cdata @@md>
    This example simply shows that **@value** also work on **\<textarea>** and **\<select>**
    elements.
    </!cdata>
    <*w.code @@extract="select/select.ts#all>>main"/>
}`;

export const forms3 = $template`() => {
    <!cdata @@md>
    # Input bindings data conversion
    </!cdata>
    <*w.notions>
        <.notion name="@value input2data & data2input"> to convert data between input and data model </>
    </>
    <*w.demo src="forms3" height=200/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms3/forms3.ts#data-model"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms3/forms3.ts#template"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms3/forms3.ts#conversions"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;

