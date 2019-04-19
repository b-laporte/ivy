require('./index.html'); // webpack dependency
import { template } from "../../iv";

let greetings = template(`(name) => {
    <span click()={changeName()}>
        # Hello {name} #
    </span>
}`);

let tpl = greetings().attach(document.getElementById("main")).refresh({ name: "World" });

let count = 0;
function changeName() {
    // todo: improve with no reference to tpl instance
    tpl.refresh({ name: "World " + (++count) });
}
