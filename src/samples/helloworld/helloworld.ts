
import { htmlRenderer } from "../../htmlrenderer";

function hello(name) {`
     <div> Hello {{name}}! </div>
`}

let r = htmlRenderer(document.getElementById("root"), hello);
r.refresh({ name: "World" });
