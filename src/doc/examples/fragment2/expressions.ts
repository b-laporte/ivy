// @@extract: start
import { $template } from "../../../iv";

// @@extract: process-function
function processText(t: string) {
    return "~ " + t + " ~";
}

// @@extract: template
const samples = $template`(data, text = "[no text]") => {
    // @@extract: attributes
    <div title={data.title}> This text has a dynamic tooltip </div>
    <div class={data.cls}> This text should be green </div>
    // @@extract: text
    <div> {data.txt + "!"} </div> // will print ' Dynamic text! '
    <div class="dynamic" title=123> 
        This is also dynamic: {processText(text)+ "!"}
    </div>
    // @@extract: properties
    <div [className]={data.className}> This text should be blue </div>
    // @@extract: one-time
    <div> This will be set only once: {::processText(text)} </div>
}`;

// @@extract: data
let data = {
    title: "Hello World",
    className: "blue",
    dynamic: "dynamic",
    cls: "green",
    txt: "Dynamic text"
}

// @@extract: instantiation
const sample = samples().attach(document.body).render({
    data,
    text: "Hello ivy"
});