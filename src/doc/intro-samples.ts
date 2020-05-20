import { $template } from "../iv";
import { $fragment } from '../iv/fragment';

// @@extract: hello
const hello = $template`(name:string) => {
    <div class="hello">
        Hello {name}!
    </div>
}`;

// @@extract: greetings
const greet = $template`(name:string, className="") => {
    <div class={"greeting " + className}>
        Hello {name}
    </div>
}`;

const greetings = $template`() => {
    <div class="main">
        <*greet name="Homer"/>
        <*greet className="blue" name="Maggie"/>
    </div>
}`;

// @@extract: jsStatements
const greetings2 = $template`(nameList:string[]) => {
    $let count=0;
    <div class="rows">
        $for (let name of nameList) {
            <*greet {name} className={++count%2 ? "a":"b"}/>
            $if (count===3) {
                (third item)
            }
        }
    </>
}`;

// @@extract: tabs
const nav = $template`(tabSelection:string, $api) => {
    <*tabs selection={=$api.tabSelection}>
        <.tab id="tabA">
            <.title> tab title <b> A </></>
            <*heavyComponent id="cptA"/>
        </>
        <.tab id="tabB">
            <.title> tab title <b> B </></>
            <*heavyComponent id="cptB"/>
        </>
    </>
}`;

// @@extract: decorators
const decos = $template`(data, $content) => {
    // event listeners (built-in decorator)
    <div @onclick={e=>doSomething(e, data)} > ... </>
    // input bindings (custom, provided with ivy)
    <input type="text" @value={=data.name} />
    // any custom decorator, multiple arguments
    <div @tooltip(text={data.text} pos="top")> ... </>
    // content projection (built-in, no args)
    <div @content/>
}`;

// @@extract: labels
const loopWithLabels = $template`(nameList:string[]) => {
    <ul>
        $each (nameList, (name, idx, isLast) => {
            <li #item #third={idx===2}> {name} </>
        });
    </>
}`;

// @@extract: fragments
let content = $fragment`
    <div class={helloClass}> 
        Hello <b> World </b> 
    </>
    <*alert type="warning">
        <.title> <b> Warning !! </b>: </>
        Some important message...
    </>
`;

// @@extract: preprocessors
const demo = $template`(name:string) => {
    <div class="demo">
        <!cdata @@md>
        # markdown preprocessor
        This text was generated through the **[xjs][]**
        markdown **pre-processor**.

        [xjs]: https://github.com/AmadeusITGroup/xjs
        </!cdata>
        // back to HTML
        (end - not markdown)
    </div>
}`;
