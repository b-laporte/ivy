require('./index.html'); // webpack dependency
import { template, API } from "../../iv";

let count = 0;

@API class HelloAPI {
    name: string;
}

const hello = template(`($api:HelloAPI) => {
    <div click()={$api.name += ++count} selectstart(e)={e.preventDefault()}>
        # Hello {$api.name} #
    </div>
}`);

const greetings = template(`(names) => {
    for (let name of names) {
        <*hello name={name}/>
    }
}`);

let tpl = greetings()
    .attach(document.getElementById("main"))
    .render({ names: ["Homer", "Marge", "Bart", "Lisa", "Maggie"] });
