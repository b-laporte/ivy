// @@extract: all
import { $template } from "../../../iv";
import { value } from "../../../iv/inputs";

// @@extract: innerHTML-import
import { unsafeInnerHTML } from '../../../iv/innerHTML';

// @@extract: main
const main = $template`(html:string, $api) => {
    <div class="col">
        <div> Enter some HTML: </div>
        <textarea @value={=$api.html}/>
    </>
    <div class="col">
        <div class="output"> Output: </>
        <div @unsafeInnerHTML={html} />
    </>
}`;

main().attach(document.getElementById("main")).render({
    html: `\
    <div class="blue"> 
        Hello <b> World </b> 
    </div>
`});
