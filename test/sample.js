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

var iv = function (strings, ...values) {
};

// possible code generation..
var pkg = iv`
    <template #foo bar baz c>
        <div [title]=c.getTitle()>abc</div>
        <div #x>
            <div #y></div>
            % if (baz) {
            <div #z></div>
            % }
        </div>
    </template>
`;

// simple node
// nested nodes
// text node
// insert node
// js expression
// js block / nested blocks
// comment blocks?
// no-value attributes
// bound 1- and 2-ways attribute
// deferred function attribute
// Component nodes
// @nodes

function foo($v, $n, $s, $e, $a, bar, baz, c) {
    $s(0, c.getTitle()); // div
    $a('content'); // ######### should be by default and shouldn't be generated here
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
    [0, 3, "div"],
    [1, 1, "abc"],
    [2, 3, "div", {'id': 'x'}]
]

// possible code generation..
var pkg1 = iv`
    <template #foo bar baz c>
        <div [title]=c.getTitle()>abc</div>
        <div #x>
            <div #y></div>
            % if (baz) {
            <div #z></div>
            % }
        </div>
    </template>
`;

// simple node
// nested nodes
// text node
// insert node
// js expression
// js block / nested blocks
// comment blocks?
// no-value attributes
// bound 1- and 2-ways attribute
// deferred function attribute
// Component nodes
// @nodes
var Section = {} // component object

var pkg = `
    <import ${Section}/> // or <import src=${Section}/> or <import ${[Section, MyWidget]}/>
    
    <template #info person>
        % if (!person) {
            <div class="main" [class.vip]=person.vip>
                % var text = person.title + " " + person.lastName;
                <Section [class.dark]=(55<person.age)>
                    <div @title> {{text}} </div>
                    <div $foo>Some content here<br/>and here</div>
                    <personDetails [person]=person> // or <insert template=personDetails [person]=person> ...</insert>
                        <div @msg><img src="warning.png"/> This is a message! </div>
                    </personDetails>
                </Section>
            </div>
        % } else {
            <div class="nodata"> Sorry - no data available </div>
        % }
    </template>
    
    <template #personDetails person msg:IvNode>
        % var properties = ["firstName", "lastName", "age", "gender"];
        % for (var k in properties) {
            <div class="detail">
                <span class="key">{{k}}: </span>
                <span class="value">{{properties[k]}}</span>
            </div>
        % }
        {{msg}}
    </template>
`

// Using it
var tpl = HtmlRenderer.render("mydiv", pkg.info.apply(myperson)); // arguments could be passed by name or by position

// Refresh after data change
tpl.refresh(myperson2);

pkg = {
    info: iv.$template(
        function ($c, $n, $e, $a, person) {
            var $v = $c.$v, personDetails = $c.$pkg.personDetails;
            person = person || {};

            $c.n(0);
            if (!person) {
                $c.n(1, 14); // can be optimized when contains only one node
                $n(1, 1, person.vip);
                var text = person.title + " " + person.lastName;
                $n(2, 15, 55<person.age);
                $a("title");
                $n(3, 3);
                $n(4, 12);
                $n(5, 3);
                $a("content");
                $n(6, 12, personDetails.apply(person));
                $e(2);
                $e(1);
                $e(0);
            } else {


            }
            $c.e(0);
        }, [ // statics
            [0, 14], // JS block
            [1, "div", {"class": "main"}, [["class", "vip"]]],       // <div class="main" [class.vip]=person.vip>
            [2, "Section"],
            [3, " "],
            [4],
            [5, " "],
            [6]
        ]
    ),
    personDetails: iv.$template(
        function () {

        }, [ // statics

        ]
    )
}

// export const NacNodeType = {
//     ELEMENT: 1,
//     TEXT: 3,
//     COMMENT: 8,
//     INSERT: 12,         // e.g. {{load.bar}}
//     JS_EXPRESSION: 13,  // e.g. % let load = 3;
//     JS_BLOCK: 14        // e.g. % let load = 3;
//     COMPONENT: 15
// };

var DbMonTemplate = n("template").a({ "id": "DbMonTemplate", "testName": null, "databases":null }).c(
    n("div").c(
        n("#text","{{testName}}"),
        n("table").a({"class":"table table-striped latest-data"}).c(
            n("tbody").c(
                // Database
                n("#jsbs","for (var i=0;databases.length>i;i++) {"),
                n("#js","var db=databases[i];"),
                n("tr").c(
                    n("td").a({"class":"dbname"}).c(
                        n("#text","{{db.dbname}}")
                    ),
                    // Sample
                    n("td").a({"class":"query-count"}).c(
                        n("span").a({"[className]":"db.lastSample.countClassName"}).c(
                            n("#text","{{db.lastSample.nbQueries}}")
                        )
                    ),
                    // Query
                    n("#jsbs","for (var j=0;db.lastSample.topFiveQueries.length>j;j++) {"),
                    n("#js","var q=db.lastSample.topFiveQueries[j];"),
                    n("td").a({"[className]":"q.elapsedClassName"}).c(
                        n("#text","{{q.formatElapsed}}"),
                        n("div").a({"class":"popover left"}).c(
                            n("div").a({"class":"popover-content"}).c(
                                n("#text","{{q.query}}")
                            ),
                            n("div").a({"class":"arrow"})
                        )
                    ),
                    n("#jsbe","}")
                ),
                n("#jsbe","}")
            )
        )
    )
);

var dbmonpkg = iv `
    <template #dbmon testName:string databases:Array>
        <div>
            {{testName}}
            <table class="table table-striped latest-data">
                <tbody>
                    % for (var i=0;databases.length>i;i++) {
                    % var db=databases[i];
                    <tr>
                        <td class="dbname">{{db.dbname}}</td>
                        // Sample
                        <td class="query-count">
                            <span [className]=db.lastSample.countClassName> {{db.lastSample.nbQueries}} </span>
                        </td>
                        // Query
                        % for (var j=0;db.lastSample.topFiveQueries.length>j;j++) {
                        % var q=db.lastSample.topFiveQueries[j];
                        <td [className]=q.elapsedClassName>
                            {{q.formatElapsed}}
                            <div class="popover-content">{{q.query}}</div>
                            <div class="arrow"/>
                        </td>
                        % }
                    </tr>
                    % }
                </tbody>
            </table>
        </div>
    </template>
`