/**
 * Created by blaporte on 02/12/16.
 */

var pkg = iv `
    // Types to be supported:
    // Js types: String, Number, Boolean, Object, Array, Function
    // Iv types: IvAny, IvNode, IvContent, IvContentList(), IvFunction, IvController(), IvEventHandler(), IvEnum()

    <function #attributes>
    
        // -------------------------------------
        // simple attribute
        <function #foo bar:number=123/>
        <foo bar baz >
            <arc/>
        </foo>
        
        // usage
        // node.attributes={bar:2}
        <function bar=2/>
        // or
        <foo>
            <:bar value=2/>
        </foo>
        
        // -------------------------------------
        // complex attribute (i.e. key-value Object)
        <type #sectionTitle bold:Boolean content:IvNodeContent/>
        <type #sectionTitle.footer content:IvNodeContent/>
        <function #section title:sectionTitle content:IvNodeContent/>
        
        // usage
        <section>
            <:title bold=true> 
                Hello <b>World</b> 
                <:footer> Glad to see you! </:footer>
            </:title>
            This is the section content
        </section>
        // or
        <section title={bold:true, content:IvNode(...)}/> // attribute order matter
        
        // -------------------------------------
        // list of simple attributes
        <function #baz fooList:[Number]/>
        // node.attributes.fooList=[1,2,3]
        
        // usage
        <baz fooList=[1,2,3]/>
        // or
        <baz>
            <:foo value=1/>
            <:foo value=2/>
            <:foo value=3/>
        </baz>
        // or
        <baz>
            <:fooList value=[1,2,3]/>
        </baz>
        
        // -------------------------------------
        // list of complex attributes
        <type #tabbarItem ref:Number title:IvNode content:IvNodeContent/>
        <function #tabbar tabList:[tabbarItem]/>
        
        <tabbar>
            <:tab ref=1>
                <:title> Some <b><htm></htm>l title</b> </:title>
                Tab 1 content here
            </:tab>
            <:tab ref=2> // ref is default attribute
                <:title> title 1 </:title>
                Tab 2 content here
            </:tab>
        </tabbar>
        // or
        <tabs tabList=[{
                ref:1,
                title: IvNode(...),
                content: IvNode(...)
            }, {
                ref:2,
                title: IvNode(...),
                $content: IvNode(...)
           }
        ]/>
        // or 
        <tabs>
            <:tabList value=[{
                    ref:1,
                    title: IvNode(...),
                    $content: IvNode(...)
                }, {
                    ref:2,
                    title: IvNode(...),
                    $content: IvNode(...)
            }]/>
        </tabs>
        
    </function>
`;

var pkg2 = iv`
    <function #foo>
                // -------------------------------------
        // list of content attributes
        // when we need a list of them and not only a list for each category of attributes
        <type #selectLabel content:IvNodeContent/> // $content is always of type IvNode
        <type #selectSeparator/> 
        <type #selectOption ref:IvAny content:IvContent/>
        <function #select   c:IvController(${MyComponentController})
                            content:IvContentList({label:selectLabel,separator:selectSeparator,option:selectOption})/>
        // node.attributes.content=[
        //  {key:"label", value:{content:IvNode()},
        //  {key:"separator"},
        //  {key:"option", value:{ref:123, content:IvNode()}
        //  etc.
        // ]
        
        // usage
        <select>    
            <:label> Some message </:label>
            <:separator/>
            <:option ref=getRef()> option 1 </:option>
            <:option ref=2> option 2</:option>
            <:separator/>
            <:option ref=3> option 3</:option>
        </select>
        
        <b:popover #popContent>
            <:header> Some header content with a <a href=""> link </a>! </:header>
            Some content...
        </b:popover>
        
        // TODO need for custom class to avoid repeating inline attributes
        <b:poplink target=popContent trigger="hover" delay=200> Hover me! </b:poplink>
        
        // or
        <div @popover={target:popContent, trigger:"hover", delay:200}> Hover me! </div>
        
        // -------------------------------------
        // template attributes
        <function #datepicker daytemplate:IvFunction dayformat:String placeholder:String/>
        
        // usage
        <datepicker dayformat="DDMMYYYY" placeholder="Enter a date">
            <:daytemplate>
                <function day selected>
                    <div> </div>
                </function>
            </:daytemplate>
        </datepicker>
        
        // or (assuming mytemplate is defined in the package)
        <datepicker dayformat="DDMMYYYY" placeholder="Enter a date" daytemplate=mytemplate/>
    </function>
`
