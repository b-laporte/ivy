// @@extract: all
import { $template } from "../../../iv";

// @@extract: row
const row = $template`(text:string, oddBkg=false) => {
    <div class={oddBkg? "odd" : "even"}> {text} </div>
    $if (oddBkg) {
        <hr/>
    }
}`;

// @@extract: loop1
const greetings1 = $template`(nameList:string[]) => {
    <div class="rows">
        $each (nameList, (name, idx, isLast) => {
            <*row text={name} oddBkg={idx % 2 === 1}/>
            $if (isLast) {
                <div> (end) </>
            }
        });
    </>
}`;

// @@extract: loop2
const greetings2 = $template`(nameList:string[]) => {
    $let count=0;
    <div class="rows">
        $for (let name of nameList) {
            <*row text={name} oddBkg={count % 2 === 1}/>
            $exec count++;
            // open your console to see those logs
            $log("greetings1 data: ", name, count); // shortcut to $exec console.log;
        }
    </>
}`;

// @@extract: main
// main layout
const main = $template`(nameList:string[]) => {
    <div class="main">
        <div class="col">
            <*greetings1 {nameList}/>
        </>
        <div class="col">
            <*greetings2 {nameList}/>
        </>
    </>
}`

// @@extract: instantiation
main()
    .attach(document.body)
    .render({ nameList: ["Homer", "Marge", "Bart", "Lisa", "Maggie"] });
