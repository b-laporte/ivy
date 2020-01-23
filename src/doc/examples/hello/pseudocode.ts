import { template } from "../../../iv";

// @@extract: mental-model
// mental model equivalence 
// (actual code generation is more complex but follows the same principle)
const hello = template(`
(name:string) => {        // equivalent to ($api:{name:string}, $ctxt) => {
                          // const name = $api.name;
    <div class="hello">   // equivalent to $ctxt.createElt("div", 1, {class:"hello"});
        # Hello {name}! # // equivalent to $ctxt.addText(1, [" Hello ", name, "! "]);
    </div>                // equivalent to $ctxt.closeElt(1);
}`);

