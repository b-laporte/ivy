// @@extract: all
import { $template } from "../../../iv";

const hello = $template`(name:string) => {
    <div class="hello">
        Hello {name}!
    </div>
}`;

// @@extract: instantiation
const h1 = hello()          // return a template instance (h1 in this case)
.attach(document.body)      // attach the instance to the DOM and return h1
.render({ name: "World" }); // render h1 with "World" as name parameter (and return h1)
