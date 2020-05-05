// @@extract: start
import { $template } from "../../../iv";
import * as lib from "./lib";

// @@extract: greet
const greet = $template`(name:string, suffix="!", className="") => {
    <div class={"greeting " + className}>
        Hello {name}
        <*lib.text value={suffix} />
    </div>
}`;

// @@extract: main
const main = $template`(name:string) => {
    <div class="main">
        <*greet name="Homer"/>
        <*greet {name} suffix="!!!"/> // {name} is equivalent to name={name}
        <*greet className="blue" name="Maggie" suffix=":-)"/>
    </div>
}`;

// @@extract: instantiation
main().attach(document.body).render({ name: "Marge" });
