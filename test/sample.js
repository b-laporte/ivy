/**
 * Sketch pad - draft for future syntax
 * Created by blaporte on 31/03/16.
 * Copyright Bertrand Laporte 2016
 */

var Component = () => {
};
var Property = (id) => {
    console.log('evaluated', id);
    return (target, property, descriptor) => console.log('executed', id);
};

//@Component()
class MyComponent {
    @Property(1)
    myprop;

    constructor() {
        this.myprop = "aaa";
    }

    static getTemplate() {
        return iv`
            <import ${mycomponents}/>
            
            <template bar:boolean=false c:MyComponent >
                <Section #main>
                    <div @title><img src=”foo.png”/>Hello</div>
                    % if (c.bar) {
                        <div content data-foo=1+2+3+c.blah >
                            <section #child title=”World”>
                                <div @content>blah</div>
                                <template @tadaa x y z>
                                    <Foo [blah]=x [bar]=y+2 [z]=z/>
                                </template>
                            </section>
                        </div>
                    % }
                </Section>
            </template>
        `;
    }
}


var samples = iv`
    // template that receives a IvNodeList as argument
    <template #Call1>
        <Cpt1>
            <div @title>Some text and <img/></div>
        </Cpt1>
    </template>
    <template #Cpt1 title:IvNodeList>
        Text before
        {{title}}
        Text after
    </template>
    
    // template that receives another template as argument
    <template #Call2 bar>
        <Cpt2>
            <template @dosth arg1>
                // arg1 will be passed by Cpt2
                Some Text
                {{bar}} + {{arg1}} // equivalent to closure
            </template>
        </Cpt2>
    </template>
    <template #Cpt2 dosth:IvTemplate="DefaultTemplate"> // default: either template id or template ref
        Text before
        % var rnd = Math.random();
        <apply template=dosth [arg1]=rnd/>
        // or
        % var foo = dosth.apply({arg1:rnd});
        Text after
    </template>
    
    // sample tabset usage
    <template #Call3 c:MyComponent>
        <TabSet [[selection]]=c.selection>
            <div @tab #tab1 title="First tab">
                Content 1    
            </div>
            <div @tab #tab2>
                <div @title>Title 2</div>
                Content 2
            </div>
            <div @tab #tab3>
                <div @title>Title 2</div>
                <div @content>Content 3</div>
            </div>
        </TabSet>
    </template>
`



// possible code generation..
var iv`
    <template #foo bar baz>
        <div>abc</div>
        <div #x>
            <div #y></div>
            % if (baz) {
            <div #z></div>
            % }
        </div>
    </template>
`;

function foo ($n,$s,$e,$a,bar,baz) {
    $s(0); // div
    $a('content'); // ######### should be by default and shouldn't be generated
    $n(1); // abc
    $e(0); // /div

    $s(2); // div#x
    $n(3); // div#y
    $s(4); // if (baz) {
    if (baz) {
        $n(5); // div #z
    }
    $e(4); // }
    $e(2); // /div#x
}
foo.statics = [
    [0,3, "div"],
    [1,1,"abc"],
    [2,3,"div",{'id':'x'}]
]