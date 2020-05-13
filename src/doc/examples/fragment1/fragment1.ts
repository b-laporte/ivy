import { value } from "../../../iv/inputs";
import { $template } from "../../../iv";

// @@extract: fragment-import
import { fragment, $fragment } from '../../../iv/fragment';

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
const main = $template`(content, $api) => {
    <div class="col">
        <div> Input: </div>
        <textarea @value={=content.template}/>
    </>
    <div class="col">
        <div class="output"> Output: </>
        <div @fragment(value={content} {context}) />
    </>
}`;

let content = $fragment`\
    <div class={helloClass}> 
        Hello <b> World </b> 
    </>
    <*alert type="warning">
        <.title> <b> Warning !!! </b>: </>
        Some important message...
    </>
`;
main().attach(document.getElementById("main")).render({ content });
