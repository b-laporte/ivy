import { VdRenderer } from "../../iv";
import { htmlRenderer } from "../../htmlrenderer";

let r = htmlRenderer(document.getElementById("root"), hello);

function hello(r:VdRenderer, name) {`
    <div> Hello {{name}}! </div>
`}

r.refresh({ name: "World" });
