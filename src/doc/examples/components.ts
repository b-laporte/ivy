import { $template } from '../../iv';
import w from '../widgets';

export const controller1 = $template`() => {
    <!cdata @@md>
    # Template controllers & components
    </!cdata>
    <*w.notions>
        <.notion name="@Controller"> to define private state and methods associated to a template </>
        <.notion name="$api property"> to define the public api associated to a controller </>
    </>
    <!cdata @@md="top-desc">
    Until now, all examples showed templates that could only keep state through their public 
    attributes (aka. API). In this example we will see how private state can be associated to 
    a template thanks to a Controller class. 

    Note: in this series of examples we call **components** the templates associated to a controller.
    </!cdata>
    <*w.demo src="controller1" height=340/>
    <!cdata @@md>
    Functionally, this example is built around a *keypad* component that also contains a display
    area to show a pin number that can be typed on the pad. However, for the sake of the example 
    we decided not to put the value as public keypad param. As such, this value needs to be kept as a 
    private state that will only be publicly exposed through a *submit* event.

    Consequently the keypad only exposes the following api:
    - a *submit* event, raised when the submit button is pressed and passing the keypad value as event 
    data
    - a *placeholder* text displayed when the pin is empty (e.g. "enter your pin"):

    As you can guess, the public API is described through an **@API** class:
    </!cdata>
    <*w.code @@extract="controller1/keypad.ts#data-definition"/>
    <!cdata @@md>
    and similarly the Controller is defined through an **@Controller** class:
    </!cdata>
    <*w.code @@extract="controller1/keypad.ts#controller"/>
    <!cdata @@md>
    Like for @API, @Controller is a specialized version of @Data, which means that Controller classes
    are also trax objects and any change on these objects will automatically trigger a template 
    refresh.

    You will also note that the $api should be now defined as a property of the controller - as the
    controller class needs to access the public API (which is also the public state).

    At this stage, we now simply need to connect the @Controller class with its template. This is
    done through another special template argument named **$**. The $ symbol is actually synonym for
    template controller in the ivy template function:
    </!cdata>
    <*w.code @@extract="controller1/keypad.ts#template"/>
    <!cdata @@md>
    The implementation of this template is pretty straightforward. You may note however the 2 possible
    ways to handle the *disabled* property on the button:
    - the *clear* button handles disabled as an HTML attribute, this is why the expression should return
    undefined to have the attribute removed from the DOM (as HTML doesn't support something like disabled="false")
    - the *submit* button handles disabled as an element property that accepts a boolean value 
    
    (cf. 2nd example of this series explaining difference between attributes an properties)
    </!cdata>
    
}`;

export const controller2 = $template`() => {
    <!cdata @@md>
    # I/O params
    </!cdata>
    <*w.notions>
        <.notion name="@io params"> to define params that are both input and output </>
        <.notion name="2-way biding expressions"> e.g. !{=x.y!} </>
        <.notion name="setting or removing attributes"> e.g. to enable or disable an input or button </>
    </>
    <!cdata @@md="top-desc">
    This example shows how to define API parameters that can be both input and output parameters.
    In the HTML world, a good example of such parameter is the \<input\> *value* param that can 
    - change the input value if changed through the input API (e.g. through the HTML attribute or
    through the JavaScript value property) - in this case *value* is an *input*
    - will be changed by the input when a user interacts with it (in this case *value* is used as 
    an *output*)
    </!cdata>
    <*w.demo src="controller2" height=310/>
    <!cdata @@md>
    Functionally this example differs from the previous example in a few ways:
    - here the keypad component doesn't display the value anymore, but exposes it as an *i/o* value param.
    This allows the keypad user to display the value in different possible manners without impacting
    the keypad component.
    - the keypad host template can also change the value by pressing on the *change* link that will reset
    the value to '123'

    Here is how the keypad usage looks like:
    </!cdata>
    <*w.code @@extract="controller2/controller2.ts#main"/>
    <!cdata @@md>
    You will note that the expression used to bind the keypad value to the pin argument is slightly
    different from normal expressions as it starts with an *=* sign (i.e. *value={=$api.pin}*). 
    This is because this expression is a **2-way binding expression**. Those expressions only accept
    assignable expressions as values - i.e expressions matching the *a.b* pattern (like
    foo.bar or $api.pin in this example).

    That being said, let's now have a look at the keypad implementation. The first piece to define
    is the keypad API that contains the i/o value parameter.
    As i/o parameters are slightly different form normal params that are input-only, they need to
    be explicitly flagged as such in the keypad api class thanks to a special *@io* decorator:
    </!cdata>
    <*w.code @@extract="controller2/keypad.ts#api"/>
    <!cdata @@md>
    Then, the beauty of the ivy solution is that nothing special needs to be done on the controller 
    side, except of course updating the value when need be. 
    
    Indeed, as the $api instance is a trax object, it can be watched by other objects, such as
    watchers created by the 2-way binding expressions. When notified, those watchers will
    change the data model associated to those 2-way bindings (e.g. *$api.pin* in
    this example). As the data model is
    itself a trax object, it will automatically trigger refreshes on the templates that depend on it.
    </!cdata>
    <*w.code @@extract="controller2/keypad.ts#controller"/>
    <!cdata @@md>
    The keypad template implementation is similar to the one used in the previous example:
    </!cdata>
    <*w.code @@extract="controller2/keypad.ts#template"/>
    <!cdata @@md>
    Note: when both controller ($) and api ($api) arguments are defined in a template, the controller 
    needs to be defined as the first argument, and the $api argument will be considered 
    as a shortcut to *$.$api*
    </!cdata>
}`;

export const photos = $template`() => {
    <!cdata @@md>
    # Life-cycle hooks
    </!cdata>
    <*w.notions>
        <.notion name="life-cycle hooks"> to define specific hooks on the template controller </>
        <.notion name="$init hook"> to perform some initialization when all parameters are defined </>
        <.notion name="asynchronous component load"> to load heavy components without blocking the UI thread</>
    </>
    <!cdata @@md="top-desc">
    This example shows how life-cycle hooks can be defined in a component Controller class. 
    
    Ivy components support 4 possible hooks:
    - **$init()** called when the component has been instantiated and its $api initialized (one-time call)
    - **$beforeRender()** called before every component template refresh. Changing the component state 
    in this function will not trigger any new refresh.
    - **$afterRender()** called after every component template refresh. Changing the component state
    in this function will trigger a new asynchronous refresh. As such state should not be changed in 
    this hook.
    - **$dispose()** called when the component is about to be deleted (one time call)

    All life-cycle hook functions are called synchronously. However they may be implemented
    as async function and return a Promise.
    In this case ivy will ensure that errors are properly caught through *Promise.catch()*.
    </!cdata>
    <*w.demo src="photos" height=280/>
    <!cdata @@md>
    This example showcases a simple photo viewer component that asynchronously retrieves 
    photos from a photo service during its *$init* phase:
    </!cdata>
    <*w.code @@extract="photos/photos.ts#controller"/>
    <!cdata @@md>
    As you can see, *$init()* is implemented as an asynchronous function. When the *fetch()* async
    result is received, the controller internal state is going to be changed (cf. the *photos* property)
    which will automatically result in a new template render:
    </!cdata>
    <*w.code @@extract="photos/photos.ts#template"/>
    <!cdata @@md>
    Full example:
    </!cdata>
    <*w.code @@extract="photos/photos.ts#imports>>instantiation"/>
}`;

export const tabs = $template`() => {
    <!cdata @@md>
    # Content and Param nodes lazy loading
    </!cdata>
    <*w.notions>
        <.notion name="content lazy loading"> to avoid heavy processing in unused $content and parameter nodes </>
        <.notion name="$beforeRender & $afterRender hooks"> to perform some processing before / after render </>
    </>
    <!cdata @@md="top-desc">
    This example showcases an interesting feature of ivy: content elements are only loaded when
    projected. This comes in very handy in components like tab bars that can contain heavy 
    components that should not be loaded if not displayed.
    </!cdata>
    <*w.demo src="tabs" height=310/>
    <!cdata @@md>
    As you can see, this example contains 3 different instances of *heavy* component, in 3 different 
    tabs:
    </!cdata>
    <*w.code @@extract="tabs/tabs.ts#main"/>
    <!cdata @@md>
    To prove that content elements are not loaded when not projected, the *heavy component*
    controller logs each calls to the *$init()*, *$beforeRender()* and *$afterRender()* life 
    cycle hooks:
    </!cdata>
    <*w.code @@extract="tabs/tabs.ts#heavyComponent"/>
    <!cdata @@md>
    As you can also see, content lazy loading is built-in and no special operation is required
    on the tab bar component (named *tabs* in this example):
    </!cdata>
    <*w.code @@extract="tabs/tabset.ts#controller>>template"/>
}`;

export const labels1 = $template`() => {
    <!cdata @@md>
    # Labels
    </!cdata>
    <*w.notions>
        <.notion name="#labels"> as a mean to get a reference to dom elements </>
        <.notion name="query() method"> to retrieve template elements that have been rendered </>
    </>
    <!cdata @@md="top-desc">
    This example explains how to use labels to retrieve references to DOM elements that have been rendered with ivy. 
    </!cdata>
    <*w.demo src="labels1" height=270/>
    <!cdata @@md>
    As you can see, the example demonstrates how to dynamically focus elements. This is done thanks to ivy labels that
    are special attributes starting with the *#* prefix.

    In their simplest form, labels don't take any values and can be used on elements or components - cf. *#title* and *#item*
    labels below - but labels may also be assigned a value. In this case they will be considered as **conditional labels**:
    if the value evaluates to true, the label will be set, otherwise it will be ignored (cf. *#third* label):
    </!cdata>
    <*w.code @@extract="labels1/labels1.ts#main"/>
    <!cdata @@md>
    When ivy renders a template, it automatically stores all labelled elements / components in an internal collection
    that can be queried afterwards thanks to the *query()* method exposed on all template instances (as a reminder the
    template instance is the object returned when calling the template factory function).

    The query method accepts 2 arguments:
    - first the name of the label (e.g. "#elt1") to query, or a list of labels separated by a semi-colon (e.g. "#elt1;#elt2")
    - second, an indicator telling if the full collection should be returned (by default it is false, so only the first
    matching element/component is returned).

    Here is the queries done when clicking on the *title* and *3rd item* buttons (as you can see query() returns a single item
    when the collection indicator is false):
    </!cdata>
    <*w.code @@extract="labels1/labels1.ts#focusTitle>>focus3rd"/>
    <!cdata @@md>
    Finally when the collection indicator is set to true, query() returns an Array. This is this form that is used to 
    query all items when clicking on the *next item* button:
    </!cdata>
    <*w.code @@extract="labels1/labels1.ts#focusNext"/>
}`;

export const labels2 = $template`() => {
    <!cdata @@md>
    # Labels in components
    </!cdata>
    <*w.notions>
        <.notion name="$template injection"> to access the IvTemplate API in the rendering function or in the template controller </>
        <.notion name="query() from controller methods"/>
    </>
    <*w.demo src="labels2" height=270/>
    <!cdata @@md>
    The previous example showed how to use labels on root templates but didn't explain how to use them in components 
    as label queries can only be done through the template instance API. 
    
    This is why ivy allows to inject the component template instance in component controllers 
    thanks to the **$template** property:
    </!cdata>
    <*w.code @@extract="labels2/labels2.ts#controller>>template"/>
    <!cdata @@md>
    Note: when the template is not associated to a controller, the *$template* keyword can be used as template argument 
    (like *$api* or *$content* for instance). 
    
    This is what is used in this example to query the *#title* \<h1> element from the main template:
    </!cdata>
    <*w.code @@extract="labels2/labels2.ts#main"/>
}`;

export const labels3 = $template`() => {
    <!cdata @@md>
    # Component API methods
    </!cdata>
    <*w.notions>
        <.notion name="component API methods"> to expose public methods to component callers </>
        <.notion name="#labels on components"> to retrieve a component's api </>
    </>
    <!cdata @@md="top-desc">
    The previous examples explained how to use labels on standard elements but didn't show any example with 
    components. This example covers this topic.
    </!cdata>
    <*w.demo src="labels3" height=290/>
    <!cdata @@md>
    This demo showcases 2 instances of the same component that exposes a *focus()* method. 

    From the main template perspective, this example looks similar to the previous ones, with the only difference
    that now each list item is an *item* component instance (cf. \<*item\>):
    </!cdata>
    <*w.code @@extract="labels3/labels3.ts#main"/>
    <!cdata @@md>
    When the *3rd item* or *next item* buttons are clicked, the button event handlers perform the 
    exact same operations as if \<*item\> was a normal <\li\> element (cf. *focus3rd()* and *focusNext()*):
    </!cdata>
    <*w.code @@extract="labels3/labels3.ts#actions"/>
    <!cdata @@md>
    This is because the *query()* method 
    returns the component's $api when set on a component (and because the *item* component implements a *focus()* 
    method on its public *$api$*):
    </!cdata>
    <*w.code @@extract="labels3/labels3.ts#item-api"/>
    <!cdata @@md>
    As you can see, the API class can declare the focus but cannot provide its implementation. This is because
    the *focus()* code needs to access the private part of the controller's state, which is of course not 
    available on the API instance (that only exposes public information).

    This is why the focus() implementation must be provided by the controller in its *$init()* life-cycle hook:
    </!cdata>
    <*w.code @@extract="labels3/labels3.ts#item-controller>>item-template"/>
}`;

export const clock = $template`() => {
    <!cdata @@md>
    # SVG clock
    </!cdata>
    <*w.notions>
        <.notion name="SVG components"> to handle and share SVG pieces as any other HTML part </>
        <.notion name="$dispose"> life cycle hook - to properly clean-up a component before deletion </>
    </>
    <!cdata @@md="top-desc">
    This example demonstrates how to use svg elements in ivy templates.
    </!cdata>
    <*w.demo src="clock" height=230/>
    <!cdata @@md>
    From the data perspective, a clock widget simply requires time data (i.e. hour, minutes, seconds, etc.) that should
    be updated every seconds (or like in this example every 10th of seconds).

    This is basically what is done in the controller below: a timer is created on *$init()* in order to call the *tick()* method
    every 100ms. The *tick()* method then updates the internal time data that will automatically trigger a template
    refresh on every change:
    </!cdata>
    <*w.code @@extract="clock/clock.ts#controller"/>
    <!cdata @@md>
    Of course, the timer should be cancelled when the widget is deleted - thus the *clearInterval()* call in the *$dispose()* hook.

    On the template side, ivy handles svg as any normal HTML elements. You don't even need to specify the svg XML namespace as it
    will automatically be added by the framework:
    </!cdata>
    <*w.code @@extract="clock/clock.ts#clock-template"/>
    <!cdata @@md>
    Last but not least, ivy allows to create sub-svg templates (or components), like for any HTML elements. This comes in
    quite handy as SVG internal component system is rather limited compared to ivy's capabilities:
    </!cdata>
    <*w.code @@extract="clock/clock.ts#hand-template"/>
    <!cdata @@md>
    Of course, the component instantiation doesn't differ from any other type of template:
    </!cdata>
    <*w.code @@extract="clock/clock.ts#instantiation"/>
}`;