
## TODO

### General
- consider attributes of sub-template nodes as always dynamic
- att nodes
    - change att node to empty namespace
    - support @nodes for any kind of node/attribute (not only components)
    - support constructors instead of IvObject (or Object?)
    - support of templates as @node attributes
    - support list of IvNodes and IvObjects ??
    - support multiple level of att nodes
- import / export
- component nodes
- check default attribute
- support path as property name
    - support class management at vdom level (class.foo=expr())
- support imports with namespaces
- support simple selectors on vdom
- implement basic component controllers
- offline compilation
- decide on event callback argument???
- helper to capture context for event callbacks - e.g. onclick(e,$db)=alert($db.dbname)
- support line/column nbr & node path in errors
- modify package code generation to use

(function () {
    function f1() {
        return "11-"+f2()+"-12";
    }

    function f2() {
        return "f2";
    }

    return {f1:f1, f2:f2};
})();


### HTML renderer
- support double data binding on html inputs (model / onmodelchange)
- support key-value attributes for class, style and key event handlers...

### Demos
- support todomvc sample
- svg sample

### Doc
- samples and tests
- playground?
- doc
- npm publication

## DONE

- support attribute templates IvNode and IvObject
- use smart string diffing
- introduce error logger
- implement change instruction lists
- migrate HTML renderer
- migrate dbmon sample
- move vdom to a simplified node structure
- change function syntax to foo()
- support event callbacks
- raise error on [onkeydown()] : function attributes should not be bound

--------
$arg1 : attribute name for the first argument if no name provided
$value: attribute name to define the value of an attribute as a node
$content: property name to reference the IvNode associated to the node content
$contentAttributes: attribute name to reference the attribute nodes as a list (must be defined)
$export: attribute to set on a definition node to export it as is on the JS module
$c: controller?




<select>
    <:msg> Some message </:msg>
    <:separator/>
    <:option ref=getRef()> option 1 </:option>
    <:option ref=2> option 2</:option>
    <:separator/>
    <:option ref=3> option 3</:option>
</select>
equivalent to // if $contentAttributes is defined as $contentAttributes:[]
<select $contentAttributes=[
    {$name:"msg", $content: iv.node(` Some message `)},
    {$name:"separator"},
    {$name:option, $arg1:getRef(), $content: iv.node(` option 1 `)},
    {$name:option, $arg1:2, $content: iv.node(` option 2 `)},
    {$name:"separator"},
    {$name:option, $arg1:3, $content: iv.node(` option 3 `)}
]/>


<def #select:msg $content/>
<def #select:separator/>
<def #select:option ref:String $content/>
<def #select $content:[foo,bar,baz]/>

definition of the select node (as it is not a template, it will not have shadow dom)
<def #select $export $contentAttributes:[]/>
// assumes that node used as content attributes are not defined as direct attributes

<def #datepicker
    daytemplate:IvDef=defaultDayTemplate
    dayformat:String
    model:DateObject
    placeholder:String
/>

<datepicker dayformat="DDMMYYYY" placeholder="Enter a date"
    <:daytemplate day selected>
        <div> </div>
    </:daytemplate>
</datepicker>
// or
<datepicker dayformat="DDMMYYYY" placeholder="Enter a date" daytemplate=mytemplate/>


Possible root nodes in a package

- import: to import external definitions
- include: to include the definition from another library without using prefixes

- def: define an entity that can be either
    - a node type - to be generated in the virtual dom
    - a function type - (e.g. template, animation) that wi

- node: to define a node interface
- template: to define a function associated to the
- animation: to define an animation function associated to the animation renderer



