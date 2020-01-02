import { template } from "../../../iv";

const greet = template(`(name:string) => {
    <div>
        # Hello {name} #
    </div>
}`);

const greetings = template(`(names) => {
    for (let name of names) {
        <*greet name={name}/>
    }
}`, greet);

greetings()
    .attach(document.getElementById("main"))
    .render({ names: ["Homer", "Marge", "Bart", "Lisa", "Maggie"] });
