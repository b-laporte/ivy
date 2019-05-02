require('./index.html'); // webpack dependency
import { template } from "../../iv";

let count = 0;

const hello = template(`(name, $params) => {
    <div click()={$params.name = name + ++count} selectstart(e)={e.preventDefault()}>
        # Hello {name} #
    </div>
}`);

const greetings = template(`(names) => {
    for (let name of names) {
        <*hello name={name}/>
    }
}`);

let tpl = greetings()
    .attach(document.getElementById("main"))
    .refresh({ names: ["Homer", "Marge", "Bart", "Lisa", "Maggie"] });
