require('./index.html'); // webpack dependency
import { template, API } from "../../iv";

let count = 0;

@API class Hello {
    name: string;
}
const hello = template(`($:Hello) => {
    <div @onclick={e => $.name += ++count} @onselectstart={e => e.preventDefault()}>
        # Hello {$.name} #
    </div>
}`);

const greetings = template(`(names) => {
    for (let name of names) {
        <*hello name={name}/>
    }
}`);

greetings()
    .attach(document.getElementById("main"))
    .render({ names: ["Homer", "Marge", "Bart", "Lisa", "Maggie"] });
