import { $template } from "../../iv";
import w from '../widgets';

export const trax = $template`() => {
    <!cdata @@md>
    # Trax - Trackable Data Objects

    Trax is a state management library that helps structuring and consuming data in typescript applications.
    
    ## What is it for?
    
    Most applications - in particular User Interfaces - use the MVC pattern to logically split the code in three entities: the data (aka. the Model - or state), the User Interface (aka. the View) and the actions (aka. the Controller).
    
    These entities should ideally interact as follows:
    1. during an initialization phase, the view is built from the data objects
    2. on user interaction, the view triggers events that call actions
    3. actions change the data objects (synchronously or asynchronously)
    4. data changes trigger view updates to keep the view in sync with the new data ... and back to step #2
    
    <img src="mvc.png" style="width:90%;margin-top:1rem"/>
    
    In practice this sequence is not so simple to implement as data changes cannot be observed in JS applications. Besides, performance optimizations and scalability require to minimize the number of operations to update a view - so application developers (or UI frameworks) need to know precisely what particular piece of data has changed to produce efficient UIs.
    
    This is where state management libraries step in as their goal is to offer the following possibilities:
    1. get notified when some data have changed
    2. know which part of the data have changed (and conversely which have not)
    3. ease conversion from/to JSON to store or retrieve data (from a server, a file or local storage)
    
    Many popular state management libraries (such as [redux][], [immerJS][] or [immutableJS]) have decided to use immutability as a way to solve problem #2 (if you are not familiar with **immutability**, it means that an object cannot be changed once created - so that applying changes to an object requires creating a new object instance (like for strings in JavaScript): so if data objects are immutable, they just need to be compared to know if they changed). The problem with immutability is that in a JS environment it imposes very painful, fragile and heavy coding patterns.
    
    This is why the core idea behind **trax** is to use a **versioning system instead of immutability**.
    
    ## How does it work?
    
    Here is how the previous MVC sequence is executed in a trax environment (note: more optimized versions can be implemented, but this to give the general idea).
    
    During the **initialization phase**:
    - the view is built from the data objects
    - each view fragment memorizes the version number(s) of the data object(s) it depends on
    - the view asks to be notified in case of data change (i.e. a *watcher* callback is registered)
    
    On **user interaction**, the view triggers events that call actions
    
    Then **actions** change the data objects (synchronously or asynchronously). 
    In a trax environment, actions are normal JS functions that create, update or 
    delete data objects as any *normal* JS objects. Actions don't even need to know 
    that the data objects are *trax objects* as they don't use any particular 
    setter or getter APIs (like [setState][] in React applications). 
    
    Behind the scene, here is what trax is doing:
    - trax creates hidden [property setters][] and property getters and / or [proxy][] objects at compilation time to track updates made on trax objects.
    - trax also associates an internal version number to each trax object (aka. data object)
    
    Anytime a data object is changed, trax updates its internal version number:
    - if the version number was even (e.g. 2), it is incremented (e.g. to 3). Even numbers denote objects that are **clean**.
    - if the version number was odd (e.g. 3), it remains unchanged. Odd numbers denote objects that are **dirty**
    - all parent objects of the changed object are marked as **dirty** as well (also by incrementing their version number, if need be)
    
    On first data change trax triggers an asynchronous [micro task][] to clean all dirty objects when the JS execution is complete 
    
    When all JS actions are executed, the JS thread executes the micro task and performs the following actions:
    - *dirty* objects version numbers are incremented (to make them *clean* again)
    - all associated *watcher* callbacks are called
    
    **Watcher callbacks** trigger View refresh
    - view entities compare the version number of the new data with the previous memorized version numbers (cf. step #1)
    - if version differs, the new version is memorized and the associated view fragment is recalculated
    
    ## Usage
    
    The previous explanation may give the impression that using trax is complex. It is actually the opposite. From the developer's point of view, here is what it looks like.
    
    First, the trax objects have to be defined. Let's imagine for instance that you want to model a list of 'todo' tasks - here is what you would need to write:
    
    [redux]: https://redux.js.org/
    [immerJS]: https://immerjs.github.io/immer
    [immutableJS]: https://immutable-js.github.io/immutable-js/
    [property setters]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
    [proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    [micro task]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
    [setState]: https://reactjs.org/docs/react-component.html#setstate
    </!cdata>
    <*w.code><!cdata @@ts>
    import { Data } from 'trax';

    @Data class TodoTask {
        description = "";
        done = false;
    }
    
    @Data class TodoList {
        name: string;
        tasks: TodoTask[];
    }
    </!cdata></>
    <!cdata @@md>
    As you can see, defining trax objects consists in declaring [value object][] classes annotated with the @Data decorator. This decorator is used at build time by trax to rewrite the class code and add meta-data information (trax provides [rollup][] and [webpack][] plugins for this).

    Then you will need to instantiate your data objects. This can be done either manually:
    
    [rollup]: https://rollupjs.org/
    [webpack]: https://webpack.js.org/
    [value object]: https://en.wikipedia.org/wiki/Value_object
    </!cdata>
    <*w.code><!cdata @@ts>
    const ls = new TaskList();
    ls.name = "dev todos";
    
    let t = new TodoTask();
    t.description = "assess trax";
    ls.push(t);
    </!cdata></>
    <!cdata @@md>
    or by creating the data object from a JSON object:
    </!cdata>
    <*w.code><!cdata @@ts>
    import { create } from 'trax';
    const ls = create(TaskList, {name: "dev todos", tasks:[{ description:"assess trax" }]});
    </!cdata></>
    <!cdata @@md>
    At this point, the *ls* object is created and can be consumed immediately. 

    As an example, let's imagine that we want do display the task list in the console:
    </!cdata>
    <*w.code><!cdata @@ts>
    function render(tl: TaskList) {
        console.log(\`\${tl.name}:\`);
        tl.tasks.forEach((task:TodoTask, idx:number) => {
            console.log(\`\${idx+1}. \${task.description} \${task.done? '(done!)' : ''}\`);
        });
    }
    render(ls);
    </!cdata></>
    <!cdata @@md>
    The console output should look like this:
    </!cdata>
    <*w.code><!cdata @@ts>
    dev todos:
    1. assess trax
    </!cdata></>
    <!cdata @@md>
    Now, if you want the console to keep constantly in sync with the ls data, you simply need to watch the *ls* instance and call render again anytime a change is reported:
    </!cdata>
    <*w.code><!cdata @@ts>
    import { watch } from 'trax';
    watch(ls, () => render(ls)); 
    // render will be called anytime a change occurs in ls or its children
    </!cdata></>
    <!cdata @@md>
    After that, running code like this:
    </!cdata>
    <*w.code><!cdata @@ts>
    ls.tasks[0].done = true;
    </!cdata></>
    <!cdata @@md>
    will automatically trigger an asynchronous render call that will be displayed in the console:
    </!cdata>
    <*w.code><!cdata @@ts>
    dev todos:
    1. assess trax (done!)
    </!cdata></>
    <!cdata @@md>
    As the watchers are called asynchronously (through the micro task), multiple synchronous changes will result in only one watcher call:
    </!cdata>
    <*w.code><!cdata @@ts>
    // the following set of operations will only trigger one watcher call
    ls.tasks.push(create(TodoTask, {description: "check micro-tasks"}));
    ls.tasks.name = "todo - important";
    </!cdata></>
    <!cdata @@md>
    Note: a more complete example based on the TodoMVC application is available [here](#/examples/todoMVC)

    ## Benefits
    - extremely simple - actually almost transparent compared to other solutions
    - typescript support (type validation & IDE auto-completion)
    - from / to JSON conversion
    - plugins for [rollup][] and [webpack][]
    - [tree-shaking][] support
    - small: from ~5 to ~9kb gzipped (size depends on usage - cf. tree-shakability)
    - and of course works with any UI layer

    [rollup]: https://rollupjs.org/
    [webpack]: https://webpack.js.org/
    [tree-shaking]: https://en.wikipedia.org/wiki/Tree_shaking
    </!cdata>
}`;

export const traxObjects = $template`() => {
    <!cdata @@md>
    # Data object declaration

    ## @Data
    
    Trax objects are identified thanks to the @Data class decorator that tell the 
    trax pre-processor which classes should be processed (i.e. rewritten) before 
    the typescript compilation runs.
    </!cdata>
    <*w.code><!cdata @@ts>
    import { Data } from 'trax';

    @Data class User {
        id: number;
        pseudo: string;
        email: string;
        preferences: UserPref; // UserPref is another trax object
    }
    </!cdata></>
    <!cdata @@md>
    Note: the typescript code generated by the trax pre-processor can be visualized in 
    the console output but adding a *log* comment in the @Data class.
    
    ## @ref
    Trax objects can only track properties of the following types:
    - base types: *string*, *number*, *boolean*
    - function types: *Function* or inline function type, like *(arg:string)=>void*
    - any reference: *any*
    - trax object class: e.g. *User* where User is a trax class
    - Array collections of the previous types: e.g. *number[]*, or *User[]* or *User[][]*
    - Dictionary collections of the previous types: e.g. *{[k:string]: User}* or *{[k:string]: User[]}*
    
    As you will note, it is not possible to use a type interface. This is because the current trax pre-processor doesn't look deep in the typescript dependency graph and doesn't know if a type refers to a trax class, a normal class or a type interface.
    
    This is where the **@ref** decorator comes into play as it allows to
    - declare a property as a *reference* - i.e. trax will only track the reference of the object and not the internal object changes (that would be tracked for a trax object used as property without the @ref decorator)
    - declare up to which level a collection should be tracked (e.g. it gives the possibility to only track an array, and not its items)
    </!cdata>
    <*w.code><!cdata @@ts>
    interface NameHolder {
        name: string;
    }
    
    @Data class User {
        // the following property will be tracked in depth
        supervisor: User;
    
        // the following properties will be tracked by reference only
        @ref supervisor2: User;
        @ref person: NameHolder;
    }
    </!cdata></>
    <!cdata @@md>
    In case of collections, **@ref.depth** must be used to tell how deep the collection (or sub-collection) should be tracked:
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class RefCol {
        // here only 'values' reference is tracked, not the list - equivalent to @ref.depth(1)
        @ref values: string[] = [];
        // here the list is tracked (e.g. on item add/remove) and the item references are tracked
        @ref.depth(2) people: NameHolder[];
        // here the dictionary, the list and the item references are tracked
        @ref.depth(3) names: { [name: string]: NameHolder[] }; 
    }
    </!cdata></>
    <!cdata @@md>
    Note: **@ref.depth can only be used on Arrays and Dictionaries** - in other word, it will not work on normal trax object properties.

    ## @computed
    Properties expressed through getters that only depend on their trax object can be flagged with the **@computed** decorator to have their content *[memoized][memoization]* :

    [memoization]: https://en.wikipedia.org/wiki/Memoization
    </!cdata>
    <*w.code><!cdata @@ts>
    // example from the TodoMVC use case
    @Data export class TodoApp {
        @ref filter: "ALL" | "ACTIVE" | "COMPLETED" = "ALL";
        list: Todo[];
    
        @computed get listView(): Todo[] {
            if (this.filter === "ALL") {
                return this.list;
            } else {
                const isComplete = (this.filter === "COMPLETED");
                return this.list.filter(item => item.completed === isComplete);
            }
        }
    }
    </!cdata></>
}`;

export const traxCreation = $template`() => {
    <!cdata @@md>
    # Creation, disposal and JSON conversion

    ## new operator
    The simplest - and most natural - way of creating a trax object is to create it through the new operator:
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class User {
        id: number;
    }
    let u123 = new User();
    u123.id = 123;
    </!cdata></>
    <!cdata @@md>
    Note: trax objects currently don't accept constructors.

    ## getter auto-creation
    The second way to instantiate a trax object is to have it automatically created when retrieved through a getter from another trax object (as a form of dependency injection).
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class Name {
        firstName = "";
        lastName = "[no name]";
    }
    @Data class User {
        name: Name;         // will be auto-created (as not marked as optional)
        birthName?: Name;   // will not be auto-created (optional)
    }
    
    const u = new User();
    console.log(u.name.lastName); // prints "[no name]"
    console.log(u.birthName);     // prints "undefined"
    </!cdata></>
    <!cdata @@md>
    ## create
    The third way to instantiate a trax object is to call the **create** factory:
    </!cdata>
    <*w.code><!cdata @@ts>
    function create<T>(c: Constructor<T> | Factory<T>, json?: Object): T {...}
    </!cdata></>
    <!cdata @@md>
    The purpose of the create factory is to create and initialize a trax object from data passed as a json structure.
    </!cdata>
    <*w.code><!cdata @@ts>
    let u123 = create( User, {id:123} );
    </!cdata></>
    <!cdata @@md>
    Note: when passing a deep JSON structure, trax will lazily instantiate the sub-objects - i.e. the instantiation will be done when they are retrieved for the 1st time. So if a part of the object graph is not accessed, it will never be instantiated.
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class Node {
        name: string;
        next?: Node;
    }
    let nd = create( Node, {name:"first", next: {name:"second", next: {name:"third"}}} );
    
    console.log(nd.name); // "first"
    // nd.next is not fully instantiated, nd.next.next is not even created at this stage
    console.log(nd.next.name); // "second"
    // nd.next.next is created by not fully initialized
    console.log(nd.next.next.name); // "third"
    // all nodes are created & initialized
    </!cdata></>
    <!cdata @@md>
    ## convertToJson()
    </!cdata>
    <*w.code><!cdata @@ts>
    function convertToJson(d: any, converter?: JSConverter): Object {...}
    </!cdata></>
    <!cdata @@md>
    As the name implies, the goal of this function is to convert a trax object (and its child objects) to a JSON structure - so that it can be stored or sent to a server for instance:
    </!cdata>
    <*w.code><!cdata @@ts>
    const nd = create( Node, {name:"first", next: {name:"second", next: {name:"third"}}} );

    nd.next.name = "new_second";
    
    const json = convertToJson(nd);
    console.log(json);
    // output: {name:"first", next: {name:"new_second", next: {name:"third"}}}
    </!cdata></>
    <!cdata @@md>
    In case of special conversion needs (e.g. to avoid converting sub-objects), a second *converter* argument can be passed to *convertToJson*. The converter is a function that will be called for each object property and that should return the value to set in the JSON result.

    On top of the object to convert, the converter function is passed with a *JSConversionContext* argument that provides contextual information about the current conversion.
    </!cdata>
    <*w.code><!cdata @@ts>
    interface JSConversionContext {
        // getDefaultConversion: call the default converter (that may call back the custom 
        // converter on sub-objects)
        getDefaultConversion(): any;   
        // getPreviousConversion: return a JSON object if the current object has already  
        // been converted (e.g. in the case of a diamond graph) - return undefined otherwise
        getPreviousConversion(): any;  
    }
    </!cdata></>
    <!cdata @@md>
    Example:
    </!cdata>
    <*w.code><!cdata @@ts>
    const nd = create( Node, {name:"first", next: {name:"second", next: {name:"third"}}} );

    function cc(o: any, cc: JSConversionContext) {
        if (o.constructor === Node && o.name==="third") {
            return "THIRD"; // should return undefined to remove this node from the output
        }
        return cc.getDefaultConversion(); // use the default converter by default
    }
    
    const json = convertToJson(nd, cc);
    console.log(json);
    // output: {name:"first", next: {name:"new_second", next: "THIRD"}}
    </!cdata></>
    <!cdata @@md>
    ## dispose()
    </!cdata>
    <*w.code><!cdata @@ts>
    function dispose(traxObject: any, recursive = false): void {...}
    </!cdata></>
    <!cdata @@md>
    Last but not least, when a graph of trax objects has been created, it should be explicitly *disposed* when not used any longer. Indeed trax objects keep internal references to their parent objects (that also reference them) and that can create memory leaks if not properly cleaned-up.

    In the case of an object A referencing an object B that also references an object C (i.e. A->B->C), calling dispose(B) will:
    - remove B reference on A (forward reference)
    - remove internal A reference on B (backward reference)
    - remove internal B reference on C (backward reference on children)
    
    Note: A and C will not be disposed. If you wish B and all its children to be disposed, then the second *recursive* argument should be set to true.
    </!cdata>
}`;

export const watchers = $template`() => {
    <!cdata @@md>
    # Watchers and Trackers

    ## watch()
    </!cdata>
    <*w.code><!cdata @@ts>
    function watch(traxObject: any, fn: WatchFunction): WatchFunction | null {...}
    type WatchFunction = (o: TraxObject) => void;
    </!cdata></>
    <!cdata @@md>
    *watch* allows to register a callback to be asynchronously notified of a trax object
    changes. When the callback is called, the object being watched is *clean* again but will 
    have a different version number (cf. [introduction](#/api/trax) or [version](#/api/versions) api below);

    Any trax object can be watched, even though in practice applications will mostly focus on root objects.
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class User {
        id: number;
        name: string;
    }
    
    const u = new User();
    const cb = watch(u, ()=> {
        console.log(\`user changed: \${u.name}[\${u.id}]\`);
    });
    
    u.name = "Donald Duck";
    u.id = 42;
    
    // as the watch callback is called asynchronously when all JS operations are complete
    // the callback will only be called once (even though 2 changes were performed)
    // and the console will show:
    // user changed: Donald Duck[42]
    </!cdata></>
    <!cdata @@md>
    *watch* will also be notified of changes that occurred in sub-objects:
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class Node {
        name: string;
        next?: Node;
    }
    const n1 = create( Node, {name:"first", next: {name:"second", next: {name:"third"}}} );
    
    const cb = watch(n1, ()=> {
        console.log(\`node changed: \${u.name}\`);
    });
    
    const n3 = n1.next.next;
    n3.name = "THIRD"; // -> will trigger "node changed: first" in the console
    </!cdata></>
    <!cdata @@md>
    Note: if watch is called multiple times with the same watch function, then the watch function will 
    be called multiple times for the same change notification.

    ## unwatch()
    </!cdata>
    <*w.code><!cdata @@ts>
    function unwatch(traxObject: any, watchFn: WatchFunction | null) {...}
    </!cdata></>
    <!cdata @@md>
    As the name implies, *unwatch* allows to un-register a watch callback.

    Note: unwatch needs to be called for each watch callbacks. If the same callback has been registered multiple times, unwatch needs to be called multiple times as well.
    
    ## numberOfWatchers()
    </!cdata>
    <*w.code><!cdata @@ts>
    function numberOfWatchers(traxObject: any): number {...}
    </!cdata></>
    <!cdata @@md>
    *numberOfWatchers* tells how many watch callbacks are attached to a trax object.
    </!cdata>
    <*w.code><!cdata @@ts>
    const u = new User();
    console.log(numberOfWatchers(u)); // prints 0
    
    const cb = watch(u, ()=> {
        console.log(\`user changed: \${u.name}[\${u.id}]\`);
    });
    console.log(numberOfWatchers(u)); // prints 1
    
    unwatch(u, cb);
    console.log(numberOfWatchers(u)); // prints 0
    </!cdata></>
    <!cdata @@md>
    ## track()
    </!cdata>
    <*w.code><!cdata @@ts>
    function track(traxObject: any, fn: TrackFunction): TrackFunction | null {...}
    type TrackFunction = (
        o: TraxObject, 
        operation: string, 
        property?: string | number, 
        previousValue?: any, 
        newValue?: any) => void;
    </!cdata></>
    <!cdata @@md>
    On the contrary to *watch*, the *track* function allows to be **synchronously** notified of a trax object changes. Using this function can lead to performance issues and should be handled with special attention.

    As compared to watch, the track callback receives multiple arguments:
    1. the reference to the object being tracked
    2. a string indicating which operation was performed. It is usually "set" for classical value objects, but can also be Array mutation function names (such as "push" or "pop") on Array collections.
    3. (optional) the name or index of the property being changed
    4. (optional) the previous value of the property being changed
    5. (optional) the new value set to the property
    </!cdata>
    <*w.code><!cdata @@ts>
    const u = new User();
    let count=0;
    const cb = track(u, () => {
        count++;
        console.log(\`track #\${count} \${u.name}[\${u.id}]\`);
    });
    
    u.name = "Donald Duck";
    // console: track #1 Donald Duck[0]
    u.id = 42;
    // console: track #2 Donald Duck[42]
    
    untrack(u, cb);
    </!cdata></>
    <!cdata @@md>
    ## untrack()
    </!cdata>
    <*w.code><!cdata @@ts>
    function untrack(o: any, trackFn: TrackFunction): void {...}
    </!cdata></>
    <!cdata @@md>
    *untrack* allows to un-register a track callback associated to a trax object (cf. previous example);

    ## numberOfTrackers()
    </!cdata>
    <*w.code><!cdata @@ts>
    function numberOfTrackers(o: any): number {...}
    </!cdata></>
    <!cdata @@md>
    *numberOfTrackers* tells how many track callbacks have been registered on a trax object (similar to [numberOfWatchers](#numberOfWatchers)).
    </!cdata>
}`;

export const versions = $template`() => {
    <!cdata @@md>
    # Versions and mutations

    As explained in the [introduction](#/api/trax), trax uses an internal versioning system to be able to tell watch functions if an object has changed (or which sub-part of an object changed, compared to a previous version).
    
    ## version()
    </!cdata>
    <*w.code><!cdata @@ts>
    function version(traxObject: any): number {...}
    </!cdata></>
    <!cdata @@md>
    *version* returns the internal version associated to a trax object (0 will be returned for newly created objects or for non-trax objects);

    Version numbers follow the following pattern:
    - even numbers (e.g. 2) denote **clean** objects - i.e. objects that haven't been changed since last *watch()* callback notifications
    - odd numbers (e.g. 3) denote **dirty** objects - that is objects that have changed since last *watch()* callback notifications
    
    Note: version is useless for *track()* notifications as *track()* callbacks are called synchronously (cf. above).
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class User {
        id: number;
        email: string;
    }
    
    const u = new User();
    console.log(version(u)); // prints 0
    
    u.id = 123;
    console.log(version(u)); // prints 1
    u.email = "donald@duck.com";
    console.log(version(u)); // prints 1
    
    await changeComplete(u); // cf. below
    console.log(version(u)); // prints 2
    </!cdata></>
    <!cdata @@md>
    ## isMutating()
    </!cdata>
    <*w.code><!cdata @@ts>
    function isMutating(traxObject: any): boolean {...}
    </!cdata></>
    <!cdata @@md>
    *isMutating* tells if a trax object is being changed (i.e. if its dirty, that is if its version number is odd);
    </!cdata>
    <*w.code><!cdata @@ts>
    const u = new User();
    console.log(isMutating(u)); // prints false
    
    u.id = 123;
    console.log(isMutating(u)); // prints true
    u.email = "donald@duck.com";
    console.log(isMutating(u)); // prints true
    
    await changeComplete(u);    // cf. below
    console.log(isMutating(u)); // prints false
    </!cdata></>
    <!cdata @@md>
    ## changeComplete()
    </!cdata>
    <*w.code><!cdata @@ts>
    function changeComplete(traxObject: any): Promise<void> {...}
    </!cdata></>
    <!cdata @@md>
    *changeComplete* is a function that allows to *wait* until an object becomes *clean* again. Technically it registers a one-time callback that fulfills the promise returned by the function. In practice this function is mostly used for tests purposes (cf. above examples).

    ## commitChanges
    </!cdata>
    <*w.code><!cdata @@ts>
    function commitChanges(traxObject: any, forceNewRefreshContext = false): void {...}
    </!cdata></>
    <!cdata @@md>
    *commitChanges* allows to synchronously run the operations that are normally run in the trax 
    micro-task and that lead to the *watch()* callbacks notifications. The function returns true if 
    some changes were committed. The second argument allows to create a new refresh context in case 
    no changes were committed. The refresh context is an object that stores all the changes to be 
    committed for a given transaction. A new refresh context is systematically created when changes 
    are committed.
    </!cdata>
}`;

export const traxRelationships = $template`() => {
    <!cdata @@md>
    # Trax objects relationships

    ## isDataObject()
    </!cdata>
    <*w.code><!cdata @@ts>
    function isDataObject(traxObject: any): boolean {...}
    </!cdata></>
    <!cdata @@md>
    *isDataObject* tells if an object is a trax object or not.
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class User {
        id: number;
        email: string;
    }
    
    console.log(isDataObject(new User()));      // prints true
    console.log(isDataObject({hello:"world"})); // prints false
    </!cdata></>
    <!cdata @@md>
    ## hasParents()
    </!cdata>
    <*w.code><!cdata @@ts>
    function hasParents(traxObject: any): boolean {...}
    </!cdata></>
    <!cdata @@md>
    *hasParents* tells if a trax object is referenced by other trax objects.
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class Node {
        name: string;
        next?: Node;
    }
    const nd = create( Node, {name:"first", next: {name:"second", next: {name:"third"}}} );
    
    console.log(hasParents(nd));           // prints false
    console.log(hasParents(nd.next));      // prints true
    console.log(hasParents(nd.next.next)); // prints true
    </!cdata></>
    <!cdata @@md>
    ## getParents()
    </!cdata>
    <*w.code><!cdata @@ts>
    function getParents(traxObject: any): any[] | null {...}
    </!cdata></>
    <!cdata @@md>
    *getParents* returns the trax objects that reference a trax object;
    </!cdata>
    <*w.code><!cdata @@ts>
    const ndA = create( Node, {name:"A"}),
        ndB = create( Node, {name:"B"}),
        ndC = create( Node, {name:"C"});
    
    getParents(ndC); // returns null
    ndA.next = ndC;
    getParents(ndC); // returns [ndA]
    ndB.next = ndC;
    getParents(ndC); // returns [ndA, ndB]
    </!cdata></>
    <!cdata @@md>
    Note: if an X object references a Y object several times (through several properties) 
    it will appear several times in the list returned by getParents(Y).
    </!cdata>
}`;

export const traxProperties = $template`() => {
    <!cdata @@md>
    # Property helpers
    ## hasProperty()
    </!cdata>
    <*w.code><!cdata @@ts>
    function hasProperty(traxObject: any, propName: string): boolean {...}
    </!cdata></>
    <!cdata @@md>
    *hasProperty* tells if a property is supported by a trax object.
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class User {
        id: number;
        email: string;
    }
    const u = new User();
    console.log(hasProperty(u, "email"));   // prints true
    console.log(hasProperty(u, "pseudo"));  // prints false
    </!cdata></>
    <!cdata @@md>
    ## createProperty()
    </!cdata>
    <*w.code><!cdata @@ts>
    function createProperty(traxObject: any, propName: string | number): any {...}
    </!cdata></>
    <!cdata @@md>
    *createProperty* allows to force the creation of a property, even it it is marked as optional.
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class BTreeNode {
        data: any = "[empty]";
        left: BTreeNode;
        right?: BTreeNode; 
    }
    
    const n = create(BTreeNode, {data: "root"});
    // left is created at first get
    console.log(n.left.data);  // prints "[empty]"
    // but right is optional
    console.log(n.right);      // prints undefined
    // createProperty will force the creation:
    createProperty(n, "right");
    console.log(n.right.data); // prints "[empty]"
    </!cdata></>
    <!cdata @@md>
    ## resetProperty()
    </!cdata>
    <*w.code><!cdata @@ts>
    function resetProperty(traxObject: any, propName: string): any {...}
    </!cdata></>
    <!cdata @@md>
    *resetProperty* allows to reset a property in the same state as when the object was created.
    </!cdata>
    <*w.code><!cdata @@ts>
    // cf. BTreeNode in previous example
    
    const n = new BTreeNode();
    console.log(n.data);  // prints "[empty]"
    n.data = "root";
    console.log(n.data);  // prints "root"
    n.data = "root2";
    console.log(n.data);  // prints "root2"
    resetProperty(n, "data");
    console.log(n.data);  // prints "[empty]"
    </!cdata></>
    <!cdata @@md>
    ## forEachProperty()
    </!cdata>
    <*w.code><!cdata @@ts>
    function forEachProperty(traxObject: any, 
        processor: (propName: string, internalPropValue: any) => void): void {...}
    </!cdata></>
    <!cdata @@md>
    Last, *forEachProperty* allows to iterate overall all the properties defined on a trax object. The iteration function passed as argument will be called with 2 arguments:
    1. the property name
    2. the internal value stored for the property. This internal value may be different from the value retrieved when accessing the property, as it will be undefined until the first getter or setter is called:
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class User {
        id: number;
        email: string;
        supervisor: User;
    };
    
    const u = new User();
    
    forEachProperty(u, (name, internalValue) => {
        console.log(\`\${name}: \${internalValue}\`);
    });
    // prints:
    // id: undefined
    // email: undefined
    // supervisor: undefined
    
    u.id = 123;
    console.log(u.email); // prints "" (but will force email initialization)
    
    forEachProperty(u, (name, internalValue) => {
        console.log(\`\${name}: \${internalValue}\`);
    });
    // prints:
    // id: 123
    // email: 
    // supervisor: undefined
    </!cdata></>
}`;

export const traxCheatSheet = $template`() => {
    <!cdata @@md>
    # Syntax Summary

    The following example summarizes what can be written in a Trax object definition
    </!cdata>
    <*w.code><!cdata @@ts>
    @Data class SyntaxSummary {
        // base types/interfaces
        name: string = "abc";
        quantity: number = expression();
        important: boolean;
        xyz: any;
        focus: () => void;
        someFunc: Function;
    
        // class types
        myObject1: MyClass; // will only be deeply tracked if MyClass is a @Data object
        myObject2?: MyClass;
        myObject3: MyClass | null;
        myObject4: NonTraxClass = new NonTraxClass("abc"); 
        // tracked by ref as NonTraxClass is not a trax class
    
        // arrays
        arr1: string[];
        arr2: MyClass[];
        arr3: MyClass[][];
        arr4: (MyClass | null)[];
        arr5: number[] = [1, 2, 3];
        arr6?: MyClass[];           // equivalent to MyClass[] | undefined
    
        // dictionaries
        dict1: { [k: string]: string }
        dict2: { [k: string]: MyClass }
    
        // references and interfaces
        @ref prop1: MyClass;        
        // prop1 will not be deeply tracked, only its reference -> for readonly objects
        @ref prop2: MyInterface;    
        // prop2 will not be deeply tracked, only its reference -> for readonly objects
        @ref dict3: { [k: string]: string };
        // dict3 will not be tracked, only its reference
        @ref.depth(1) dict4: { [k: string]: MyInterface }
        // dict4 will be tracked, but only the references to MyInterface
        @ref.depth(2) dict5: { [k: string]: MyInterface[] }
        // dict5 and array will be tracked, not the internal of MyInterface
        // note: @ref.depth can only be used on Arrays and Dictionaries
    
        // computed properties
        @computed get arrLength() {
            if (!this.arr1) return 0;
            return this.arr1.length;
        }
    
        // virtual property name:quantity - e.g. "name:123"
        set nameQuantity(value: string) {
            let arr = value.split(":");
            if (arr.length === 2) {
                this.name = arr[0];
                this.quantity = parseInt(arr[1], 10);
            }
        }
    
        // methods are accepted depending on compilation options (true by default)
        someMethod() {
            return doSomething(this);
        }
    }
    </!cdata></>
    <!cdata @@md>
    ## Design Golden Rules
    - read-only objects should be stored as JSON objects/interfaces referenced through @ref
    - avoid object mutation in watch callbacks as they will trigger another synchronization loop
    </!cdata>
}`;
