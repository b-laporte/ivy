require('./index.html'); // webpack dependency
import { template } from "../../iv";

let hello = template(`() => {
    # Hello World #
}`);

hello().attach(document.getElementById("main")).refresh();
