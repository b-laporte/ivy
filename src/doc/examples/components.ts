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
    - change the input value if changed through the input API (in this case *value* is an *input*)
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
    <*w.demo src="photos" height=280/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="photos/photos.ts#controller"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="photos/photos.ts#template"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;

export const tabs = $template`() => {
    <!cdata @@md>
    # Content and Param nodes lazy loading
    </!cdata>
    <*w.notions>
        <.notion name="content lazy loading"> to avoid heavy processing in unused $content and parameter nodes </>
        <.notion name="$beforeRender & $afterRender hooks"> to perform some processing before / after render </>
    </>
    <*w.demo src="tabs" height=310/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="tabs/tabs.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="tabs/tabs.ts#heavyComponent"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="tabs/tabset.ts#controller"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="tabs/tabset.ts#template"/>
}`;

export const labels1 = $template`() => {
    <!cdata @@md>
    # Labels
    </!cdata>
    <*w.notions>
        <.notion name="#labels"> as a mean to get a reference to dom elements </>
        <.notion name="query() method"> to retrieve template elements that have been rendered </>
    </>
    <*w.demo src="labels1" height=270/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels1/labels1.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels1/labels1.ts#focusTitle"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels1/labels1.ts#focus3rd"/>
    <!cdata @@md>
    ...
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
    ...
    </!cdata>
    <*w.code @@extract="labels2/labels2.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels2/labels2.ts#template"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels2/labels2.ts#controller"/>
}`;

export const labels3 = $template`() => {
    <!cdata @@md>
    # Component API methods
    </!cdata>
    <*w.notions>
        <.notion name="API methods"> to expose public methods to component callers </>
        <.notion name="#labels on components"> to retrieve a component's api </>
    </>
    <*w.demo src="labels3" height=290/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels3/labels3.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels3/labels3.ts#actions"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="labels3/labels3.ts#item-component"/>
}`;

export const clock = $template`() => {
    <!cdata @@md>
    # SVG clock
    </!cdata>
    <*w.notions>
        <.notion name="SVG"> as any other HTML elements </>
        <.notion name="$dispose"> life cycle hook </>
    </>
    <*w.demo src="clock" height=230/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="clock/clock.ts#controller"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="clock/clock.ts#clock-template"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="clock/clock.ts#hand-template"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="clock/clock.ts#instantiation"/>
}`;