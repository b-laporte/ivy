require('./index.html'); // webpack dependency
import { template } from "../../iv";


let count = 0;

let greetings = template(`(name, $params) => {
    <span click()={$params.name = name + ++count} selectstart(e)={e.preventDefault()}>
        # Hello {name} #
    </span>
}`);

let tpl = greetings().attach(document.getElementById("main")).refresh({ name: "World" });
