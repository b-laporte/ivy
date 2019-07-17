require('./index.html'); // webpack dependency
import { template, API } from "../../iv";

let count = 0;

@API class HelloAPI {
    name: string;
    changeName: () => void;
}

const hello = template(`($api:HelloAPI, name) => { //  /* shortcut to $api.name */
    if (!$api.changeName) {
        // initialize the API
        $api.changeName = () => {
            console.log("change name!");
            $api.name = name + ++count;
        }
    }
    
    <div click()={$api.changeName()} selectstart(e)={e.preventDefault()}>
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
