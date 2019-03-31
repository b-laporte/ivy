require('./index.html'); // webpack dependency
import { template } from "../../iv";

let greetings = template(`(name) => {
    # Hello {name} #
}`);

let tpl = greetings().attach(document.getElementById("main")).refresh({ name: "World" });

let count = 0;
document.body.addEventListener("click", () => {
    tpl.refresh({name:"World " + (++count)});
});
