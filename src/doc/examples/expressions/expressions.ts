import { template } from "../../../iv";

// @@extract: process-function
function processText(t: string) {
    return "~ " + t + " ~";
}

// @@extract: template
const samples = template(`(data, text = "[no text]", p:number = pi) => {
    <div title={data.title}> # This text has a dynamic tooltip # </div>
    <div [className]={data.className}> # This text should be blue # </div>
    <div class={data.cls}> # This text should be green # </div>
    <div> #{data.txt + "!"}# </div>
    <div class="dynamic" title=123> 
        # This is also dynamic: {processText(text)} # 
    </div>
    <div> # This will be set only once: {::processText(text)} # </div>
    <div> # Pi approximation: {p} # </div>
    <div class="info blue"> # >>> Click to refresh # </div>
}`);

// @@extract: instantiation
const pi = 3.14159265358;
let data = {
    title: "Hello World",
    className: "blue",
    cls: "green",
    txt: "Dynamic text"
}
const sample = samples().attach(document.body).render({
    data,
    text: "Hello ivy"
});

// @@extract: update
let count = 0;
document.addEventListener("click", () => {
    count++;
    data.title += " +" + count;
    data.txt += " +" + count;
    sample.api.text += " +" + count;
    // note: data is also accessible through sample.api.data
    sample.render();
});
