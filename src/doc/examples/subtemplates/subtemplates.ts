import { $template } from "../../../iv";

// @@extract: text
const text = $template`(value:string) => {
    {value}
}`;

// @@extract: greet
const greet = $template`(name:string, suffix="!", className="") => {
    <div class={"greeting " + className}>
        Hello {name}
        <*text value={suffix} />
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
