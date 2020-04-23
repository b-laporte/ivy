// @@extract: all
import { $template } from "../../../iv";

// @@extract: condition
const row = $template`(text:string, oddBkg=false) => {
    <div class={oddBkg? "odd" : "even"}> {text} </div>
    $if (oddBkg) {
        <hr/>
    }
}`;

// @@extract: loop
const greetings = $template`(nameList:string[]) => {
    $let count=0;
    <div class="rows">
        $for (let name of nameList) {
            <*row text={name} oddBkg={count % 2 === 1}/>
            $exec count++;
            // open your console to see those logs
            $log("greetings data: ", name, count); // shortcut to $exec console.log
        }
    </>
}`;

// @@extract: instantiation
greetings()
    .attach(document.body)
    .render({ nameList: ["Homer", "Marge", "Bart", "Lisa", "Maggie"] });
