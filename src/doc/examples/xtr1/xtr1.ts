import { value } from "../../../iv/inputs";
import { template } from "../../../iv";

// @@extract: xtr-import
import { xtrContent } from '../../../iv/xtr-renderer';

// @@extract: resolver
async function xtrResolver(ref: string): Promise<any> {
    // filter authorized references
    if (ref === "helloClass") return "blue";
    if (ref === "alert") return alert;
    console.log("UNAUTHORIZED REF: " + ref);
    return null;
}

// @@extract: template
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

// @@extract: main
const main = template(`(xtrValue:string, $api) => {
    <div> #Enter some XTR: # </>
    <textarea @value={=$api.xtrValue}/>
    
    <div class="output"> # Output: # </>
    <div @xtrContent(xtr={xtrValue} resolver={xtrResolver}) />
}`);

main().attach(document.body).render({
    xtrValue: `\
<div class={helloClass}> 
    Hello <b> World </b> 
</>
<*alert type="warning">
    <.title> <b> Achtung !!! </b>: </>
    Some important message...
</>
`});
