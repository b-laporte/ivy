import { VdRenderer } from "../../iv";
import { htmlRenderer } from "../../htmlrenderer";

let r = htmlRenderer(document.getElementById("root"), hello);

function hello(r:VdRenderer, name) {`
    <div> Hello {{name}}! </div>
`}

r.refresh({ name: "World" });

// variant with sub-functions and event handlers

// function hello(r: VdRenderer, names: string[]) {`
//     <div class="greeting">
//         % if (names && names.length) {
//             % for (let name of names) {
//                 <c:greeting [name]=name action()=alert('Hello '+name)/>
//             % }
//         % } else {
//             <span class="default"> Hello world </span>
//         % }
//     </div>
// `}

// function greeting(r:VdRenderer, name, action:()=>void) {`
//     % action = action || (() => 0);
//     Hello <span class="name" [title]=name onclick()=action()> {{name}} </span>
// `}

// r.refresh({ names: ["Arthur", "Slartibartfast"] });
