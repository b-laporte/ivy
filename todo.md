
--------------------------------------------
empty template code generation issue
const todoItem = template(`(app, todo, $template) => { }`);
=> Cannot find name 'ζs0'.
xxx return ζt("todoItem", "todomvc/todomvc.ts", ζs0, function (ζ, $, $api, $template) {
#issue #ivy #generator #simple

--------------------------------------------
support decorators on dynamic components: need to dispose / create new decorator instance
e.g. <*cptRef @cutomDeco="abc"/>
#issue #ivy #simple

--------------------------------------------
support input type="range" for @value
#feature #ivy #simple

--------------------------------------------
implement customization use case with a sub-template defined as API param (default value should be provided
by the component but could be overridden by the caller)
#doc #ivy #simple

--------------------------------------------
track references used by xtr renderer in order to trigger refresh at root level (cpt and deco references should be ignored)
e.g. <div @xtrContent(...)/>
#feature #xtr #medium

--------------------------------------------
make sure xtr is 'safe' - i.e. prevent usage of < script > tags, dangerous URL patterns (href), etc.
#feature #xtr #medium 

--------------------------------------------
fix router navigation when doc url is not on root folder - e.g. localhost:5000/public/#xyz (works for localhost:5000/#xyz )
#issue #router #simple

--------------------------------------------
support xtr char encoding in xjs text nodes - i.e. !< !! !s etc. note: !( and !# should be added to the list for both XJS and XTR
#issue #xjs #simple

--------------------------------------------
implement text node decorators - e.g. 
# (@markdown) some markdown content #
#feature #ivy #simple

--------------------------------------------
implement decorator nodes - e.g. 
<div>
    <@tooltip> 
        <.header> # complex tooltip header # </> 
        # complex tooltip content # 
    </>
</>
#feature #ivy #medium

--------------------------------------------
implement $childParams special template param to retrieve a (pseudo?) collection of all direct child param nodes
use case: menu template with .option and .separator param nodes that should be merged in one single collection
$childParams:IvParamNodes // $childParams.forEach((name, position)) / $childParams.length / $childParams.get(i)
#feature #ivy #medium

--------------------------------------------
@value: merge input2data and data2input into 1 single "adaptor" param
e.g. <input @value(data={=a.b} adaptor={adaptorRef})>
#feature #ivy #simple

--------------------------------------------
support @io and setter on @computed getter -> cf. ccdate field that would expose a "monthYear" property
e.g. 
@io @computed get monthYear() {..}
@io set monthYear(v) {...}
#feature #trax #simple #prio3

--------------------------------------------
generalize @required to all trax objects (and remove it from iv)
#feature #trax #simple

--------------------------------------------
implement forward labels to allow querying a sub-component (e.g. ##foo or ##foo="#bar")
e.g. <*cpt ##foo>
#feature #ivy #label #simple

--------------------------------------------
implement public labels description in component API (public labels can be queried by parent elements)
e.g. $labels:IvPublicLabels = ["#foo", "#bar"];
#feature #ivy #label #trax #medium

--------------------------------------------
support label union selectors 
e.g. mytemplate.query("#bar;#baz");
#feature #ivy #label #simple

--------------------------------------------
implement @classNames custom decorator to ease class concatenation
e.g. <div @classNames={{ foo:expr(), bar:expr2(), baz:1 }}>
#feature #ivy #simple

--------------------------------------------
pass component reference string for error handling (same as for decorators)
#feature #ivy #generator #simple

--------------------------------------------
support advanced parsing for io bindings expressions
e.g. <input @value={=a.b.c[expr()]['d'].e}/>
#feature #xjs #generator #simple

implement @trackBy built-in decorator on jsblocks - e.g.
for (let item of items) {
    <li @trackBy="propName"> # ... # </>
}
// or, in case of multiple child elements
for (let item of items) {
    <! @trackBy="propName">
        <div> # ... # </!>
        <div> # ... # </!>
    </>
}
#feature #ivy #advanced

--------------------------------------------
improve xtr renderer errors
#issue #xtr #simple

--------------------------------------------
do not remove // log comments as they shift line numbers in case of errors
#issue #ivy #generator #simple

--------------------------------------------
simplify cpt call ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0); -> ζcpt(ζ, ζc, 0, 0, 0, cpt, 0);
#issue #ivy #generator #simple

--------------------------------------------
update trax to support generics in EventEmitter
e.g. fooEmitter: IvEventEmitter<string>; // means event.data is a string
#issue #ivy #trax #simple

--------------------------------------------
template: support global vars as param initializer
e.g. template(`(state = globalState) => {...}`)
#feature #ivy #medium

--------------------------------------------
compiler: ensure that #main label is on a fixed node (always same position)
#issue #ivy #compiler #simple

--------------------------------------------
finalize @async
e.g. @async should register as template param so that async content changes trigger a refresh (cf. $content.isEmpty())
#feature #ivy #advanced

--------------------------------------------
proposal for dynamic forms
#research

--------------------------------------------
proposal for 'progressive load' pattern (a la Google doc: an image is displayed before the actual content)
#research

--------------------------------------------
proposal for built-in events on view/dom lifecycle - e.g. @ondomcreate @ondomdelete @ondomchange
purpose: animations
#research

--------------------------------------------
proposal to tune the view pool management policy (i.e. when a part is hidden/redisplayed)
#research

--------------------------------------------
proposal to avoid deleted stateful components (@cache ?)
#research

--------------------------------------------
proposal for advanced forms management
#research

--------------------------------------------
proposal to support dependency injection through the VDOM hierarchy
#research

--------------------------------------------
proposal for router links management
#research

--------------------------------------------
support component functions that return promises
use case: dynamic component load - cf. @load proposal for async content display
e.g. <*lazy foo="bar"/> // where lazy() will return a promise
<*lazy2 foo="bar" @load(retry=2 timeout=2000)/>
#feature #ivy #runtime #medium

--------------------------------------------
display content retrieved asynchronously () - e.g. @load built-in decorator
<div @loadIndicator="main">Loading...</div>
<*lazy1 someProp="abc" @load(indicator="main")/>
<*lazy2 someProp="abc" @load(indicator="main" timeout=3000 retry=3 onerror={e=>handleError(e)})/>
#feature #ivy #medium

