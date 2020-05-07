import { $template } from '../../iv';
import w from '../widgets';

export const trax1 = $template`() => {
    <!cdata @@md>
    # Trax Data Objects
    </!cdata>
    <*w.notions>
        <.notion name="trax objects"> to define data objects that can be tracked/watched </>
        <.notion name="watch / unwatch"> to be asynchronously notified when an object has changed </>
        <.notion name="object version"> to follow a trax object life cycle </>
    </>
    <*w.demo src="trax1" height=260/>
    <!cdata @@md>
    This example introduces the [trax][] data framework used by ivy to observe changes in data objects
    and trigger automatic HTML DOM updates.

    The example creates a *user* object (Marge Simpson) and allows to play with the *watch()* 
    and *unwatch()* functions provided by [trax][] to get notified when a change occurs on a trax object.
    For instance if you click on *watch* and then on *update*, you will see the user name being refreshed
    in the main gray panel. Conversely, if you press *unwatch*, clicking on *update* will have
    no effect.

    Here is how the demo is built. First we create a trax object definition. For this, we simply
    need to create a class with an *@Data* decorator:

    [trax]: https://github.com/AmadeusITGroup/trax
    </!cdata>
    <*w.code @@extract="trax1/trax1.ts#import>>definition"/>
    <!cdata @@md>
    Then we need to create and initialize an object instance: 
    </!cdata>
    <*w.code @@extract="trax1/trax1.ts#init"/>
    <!cdata @@md>
    At this point, the *user* object is a simple JavaScript object that can be updated if you click
    on the *update* button:
    </!cdata>
    <*w.code @@extract="trax1/trax1.ts#update"/>
    <!cdata @@md>
    Of course, nothing will happen if you click on the *update* button, unless you clicked on 
    the *watch* button beforehand.

    When clicking on *watch* a callback is registered on the trax object and will be called when
    the object changes. Technically the callback will not be called immediately after every change
    but asynchronously, once all changes are executed. Behind the scene, trax uses a [micro-task][] that
    is triggered when the operations on the main JavaScript thread are completed. This is
    why watch changes are notified asynchronously:

    [micro-task]: https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth
    </!cdata>
    <*w.code @@extract="trax1/trax1.ts#watch"/>
    <!cdata @@md>
    Note: in this example, we use another trax function (cf. *numberOfWatchers()*) to avoid registering
    multiple callbacks (as you can guess, this function tells how many watchers are registered on
    a given trax object).

    To stop watching an object, you simply need to call *unwatch()*:
    </!cdata>
    <*w.code @@extract="trax1/trax1.ts#unwatch"/>
    <!cdata @@md>
    ## How does it work?

    Technically, the trax objects are processed at build time to include some meta-information
    and getters/setters/proxies in order to be able to watch these objects. This is how a trax
    object knows that it has been changed and needs to call its watchers (if any).

    Note: as you can see, this example doesn't use ivy as trax has been designed as an independent framework.

    Full example:
    </!cdata>
    <*w.code @@extract="trax1/trax1.ts#import>>display-functions"/>
}`;

export const trax2 = $template`() => {
    <!cdata @@md>
    # Trax Directed Acyclic Graphs
    </!cdata>
    <*w.notions>
        <.notion name="connected trax objects"> to defined a DAG of data objects </>
        <.notion name="change propagation"> to track changes in the child hierarchy </>
    </>
    <*w.demo src="trax2" height=320/>
    <!cdata @@md>
    This example shows how multiple trax objects can be combined to create a graph of objects and
    how parent objects are considered changed when child objects are updated.

    In this example we create 2 classes of data objects:
    - a *User* class to store user data
    - and a *Group* class to group multiple users:
    </!cdata>
    <*w.code @@extract="trax2/trax2.ts#definition"/>
    <!cdata @@md>
    As you can see, the *Group* class has several references to the *User* class. As both *Group*
    and *User* are trax objects, any change in one of the child *User* instances will be reported to the parent
    group, so that watching the *Group* instance will be enough to catch all changes (this is what we do in this
    example).

    You will also note that the data property doesn't reference a trax object.
    This is why trax will only track the reference to the data property, but not its content (you
    can check this by playing with the *data* button). Note: all data don't need to be tracked,
    this is why it is good practice to use trax objects for read-write data, and plain JSON
    objects for read-only values.

    That said, like in the previous example instantiation and initialization are straightforward:
    </!cdata>
    <*w.code @@extract="trax2/trax2.ts#init"/>
    <!cdata @@md>
    Those instances can be updated through any JavaScript methods, like property updates or 
    Array method calls (to add/remove items in the group members).

    Here is what happens when clicking on one of the *update* buttons:
    </!cdata>
    <*w.code @@extract="trax2/trax2.ts#update-functions"/>
    <!cdata @@md>
    Of course, if *watch* has not been activated, no automatic update will be seen (like in the previous
    example):
    </!cdata>
    <*w.code @@extract="trax2/trax2.ts#watch>>unwatch"/>
}`;

export const menu1 = $template`() => {
    <!cdata @@md>
    # Multi-content templates & param nodes hierarchy
    </!cdata>
    <*w.notions>
        <.notion name="@Data param nodes"> to specify rich hierarchy of content parameters </>
        <.notion name="explicit $api type"> to define the template api as a trax object </>
        <.notion name="@API decorator"> to specify API (trax) classes </>
    </>
    <*w.demo src="menu1" height=280/>
    <!cdata @@md>
    This example shows how trax objects can be used as param nodes to support advanced param
    structures.

    As you can see, this example features a menu that can display items (described as *\<.option\>*
    nodes) in 2 different sections:
    - a *header* section, supporting a *title* param (and materialized as a *\<.header\>* node)
    - the default content body
    Besides, each item can clicked and selected.

    Here is how the menu usage looks like:
    </!cdata>
    <*w.code @@extract="menu1/menu1.ts#menu-usage"/>
    <!cdata @@md>
    Looking at this, you immediately notice that *\<.header\>* and *\<.option\>* both hold
    attributes and content. Besides *\<.header\>* can also contain a list of *\<.option\>*.

    This can be easily expressed through types. This is why ivy used trax objects to model
    those types of param nodes:
    </!cdata>
    <*w.code @@extract="menu1/menu1.ts#data-definition"/>
    <!cdata @@md>
    You will note that all Arrays are suffixed with the **List** keyword. This is actually
    a mandatory convention as the current version of the ivy compiler doesn't deeply analyse
    the type information - and the compiler needs to make the distinction between single
    param nodes and list of param nodes, thus the convention (that said, this limitation 
    could be easily lifted in the future).

    With these new param nodes, the *menu* implementation becomes straightforward:
    </!cdata>
    <*w.code @@extract="menu1/menu1.ts#menu"/>
    <!cdata @@md>
    Of course, all menus support some kind of item selection. This is why we have the
    *@onclick* event handler on the root div element.

    In this particular example we simply log the event information through a direct hack 
    to the DOM (cf. *getElementById("event-log")*), but in a full menu implementation
    we should raise a custom event instead - which is what is explained in the next example.
    </!cdata>
    <*w.code @@extract="menu1/menu1.ts#event-handler"/>
    <!cdata @@md>
    Note: in this sample the item code is retrieved through the standard DOM [dataset][] API).
    This way of handling data associated to list items is very convenient as it avoids 
    creating a event listeners for each and every item in the list.

    [dataset]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/dataset

    Last but not least, this example also shows how the template arguments can be typed as a 
    trax object. For this you simply need to type the *$api* param with a trax class.
    This class has to be decorated with the **@API** decorator instead of @Data as
    API classes require extra validations (@API is a specialized version of 
    @Data):
    </!cdata>
    <*w.code @@extract="menu1/menu1.ts#main>>menu-usage-end"/>
    <!cdata @@md>
    Note: when used with type information, the $api argument has to be first in the list.

    Full example:
    </!cdata>
    <*w.code @@extract="menu1/menu1.ts#import>>instantiation"/>
}`;

export const menu2 = $template`() => {
    <!cdata @@md>
    # Custom events (event emitters)
    </!cdata>
    <*w.notions>
        <.notion name="IvEventEmitter"> to define custom events that can be caught through standard @onXXX decorators </>
    </>
    <*w.demo src="menu2" height=260/>
    <!cdata @@md>
    This example shows how **custom events** can be supported in ivy. 
    
    Custom events allow to use standard event listeners (e.g *@onevent* that calls [addEventListener()][el] 
    behind the scene) for new events created by a template (or a component, 
    cf. next example section):

    [el]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    </!cdata>
    <*w.code @@extract="menu2/menu2.ts#menu-usage>>menu-content"/>
    <!cdata @@md>
    Declaring a new event is actually very simple as you just need to create a property
    named [eventName]Emitter with type *IvEventEmitter* (e.g. *clickEmitter:IvEventEmitter;*):
    </!cdata>
    <*w.code @@extract="menu2/menu2.ts#menu-data"/>
    <!cdata @@md>
    Then ivy will automatically create an IvEventEmitter instance that supports the **emit()** method.

    *emit()* accepts only one optional argument which is the event data. The event data can be anything (e.g. a JSON 
    object, a string, a number, etc.).
    </!cdata>
    <*w.code @@extract="menu2/menu2.ts#menu"/>
    <!cdata @@md>
    The event data can be retrieved by the event listener through the event *data* property:
    </!cdata>
    <*w.code @@extract="menu2/menu2.ts#menu-usage"/>
    <!cdata @@md>
    Full example:
    </!cdata>
    <*w.code @@extract="menu2/menu2.ts#import>>instantiation"/>
}`;
