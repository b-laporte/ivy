// @@extract: import
import { value } from "../../../iv/inputs";
import { $template } from "../../../iv";
import { $fragment, fragment } from '../../../iv/fragment';

// @@extract: content
const contentA = $fragment`
    // special char encoding with ! prefix
    <div class="special">
        <div class="info">special characters:</>
        Angle brackets: !< and !> <br/>
        Non-breaking space: "!s!s!s!s!s!s!s" (vs "       ")<br/>
        Bang: !! <br/>
        New line: !n(discarded by HTML parser)<br/>
    </>
`;

const contentB = $fragment`
    <div class="info">xtr content...</>
    <*alert type="warning">
        <.title> <b> Important! </b>: </>
        Some important message...
    </>
`;

const contentC = $fragment`
    fragment strings also accept cdata sections:
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

// @@extract: alert
const alert = $template`(type="", $content:IvContent, title:IvContent) => {
    <div class={"alert " + type}>
        <span class="title"> 
            $if (title) {
                <! @content={title}/>
            } else {
                Warning:
            }
        </>
       <! @content/>
    </>
}`;
// @@extract: context
const context = {
    helloClass: "blue",
    alert // equivalent to "alert":alert
}

// @@extract: main
const main = $template`(selection:string = "A", $api, $template) => {
    $let nm = "type" + $template.uid;
    <span> Choose your content: </>
    <label> <input type="radio" name={nm} value="A" @value={=$api.selection}/> A </>
    <label> <input type="radio" name={nm} value="B" @value={=$api.selection}/> B </>
    <label> <input type="radio" name={nm} value="C" @value={=$api.selection}/> C </>

    <div class="output"> Output: </>
    $let c = selection==="A"? contentA : (selection==="B"? contentB : contentC);
    <div @fragment(value={c} {context}) />
}`;

main().attach(document.body).render();
