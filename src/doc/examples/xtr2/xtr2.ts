import { value } from "../../../iv/inputs";
import { xtrContent } from '../../../iv/xtr-renderer';

// @@extract: xtr-import
import { template, xtr } from "../../../iv";

// @@extract: resolver
async function xtrResolver(ref: string): Promise<any> {
    // filter authorized references
    if (ref === "helloClass") return "blue";
    if (ref === "alert") return alert;
    console.log("UNAUTHORIZED REF: " + ref);
    return null;
}

const alert = template(`(type="", $content:IvContent, title:IvContent) => {
    <div class={"alert " + type}>
        <span class="title"> 
            if (title) {
                <! @content={title}/>
            } else {
                # Warning: #
            }
        </>
       <! @content/>
    </>
}`);

// @@extract: content
const contentA = xtr`
    // special char encoding with ! prefix
    <div class="special">
        <div class="info">xtr special characters:</>
        Opening angle bracket: !< (no need for >)<br/>
        Non-breaking space: "!s!s!s!s!s!s!s" (vs "       ")<br/>
        Bang: !! <br/>
        New line: !n(discarded by HTML parser)<br/>
    </>
`;

const contentB = xtr`
    <div class="info">xtr content...</>
    <*alert type="warning">
        <.title> <b> Important! </b>: </>
        Some important message...
    </>
`;

const contentC = xtr`
    XTR strings also accept cdata sections:
    <div>
        <div class="info">(before the cdata section)</>
        <!cdata>
            // Here content doesn't need to be encoded:
            <div> Hello World! </div>
            Only end of cdata needs to be escaped: !</!cdata> ...
        </!cdata>
        <div class="info">(after the cdata section)</>
    </>
`;

// @@extract: main
const main = template(`(selection:string = "A", $, $template) => {
    const nm = "type" + $template.uid;
    <span> #Choose your content: # </>
    <label> <input type="radio" name={nm} value="A" @value={=$.selection}/> # A # </>
    <label> <input type="radio" name={nm} value="B" @value={=$.selection}/> # B # </>
    <label> <input type="radio" name={nm} value="C" @value={=$.selection}/> # C # </>

    <div class="output"> # Output: # </>
    const c = selection==="A"? contentA : (selection==="B"? contentB : contentC);
    <div @xtrContent(xtr={c} resolver={xtrResolver}) />
}`);

main().attach(document.body).render();
