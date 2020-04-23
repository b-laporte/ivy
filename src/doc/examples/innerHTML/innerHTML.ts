// @@extract: all
import { $template } from "../../../iv";
import { value } from "../../../iv/inputs";

// @@extract: innerHTML-import
import { unsafeInnerHTML } from '../../../iv/innerHTML';

// @@extract: main
const main = $template`(html:string, $api) => {
    <div> Enter some HTML: </>
    <textarea @value={=$api.html}/>
    
    <div class="output"> Output: </>
    <div @unsafeInnerHTML={html} />
}`;

main().attach(document.body).render({
    html: `\
    <div class="blue"> 
        Hello <b> World </b> 
    </div>
`});
