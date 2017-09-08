import { htmlRenderer } from "../../htmlrenderer";

let r = htmlRenderer(document.getElementById("root"), hello);

function hello(name) {
    `---
     <div> Hello {{name}}! </div>
     ---`
}

r.refresh({ name: "World" });
