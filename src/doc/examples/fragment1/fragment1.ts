import { value } from "../../../iv/inputs";
import { $template } from "../../../iv";

// @@extract: fragment-import
import { fragment, $fragment } from '../../../iv/fragment';

// @@extract: template
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
const main = $template`(frg, $api) => {
    <div> Enter some text: </>
    <textarea @value={=frg.template}/>
    
    <div class="output"> Output: </>
    <div @fragment(value={frg} {context}) />
}`;

main().attach(document.body).render({
    frg: $fragment`\
        <div class={helloClass}> 
            Hello <b> World </b> 
        </>
        <*alert type="warning">
            <.title> <b> Achtung !!! </b>: </>
            Some important message...
        </>
`});
