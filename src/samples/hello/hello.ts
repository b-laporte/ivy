require('./index.html'); // webpack dependency
import { template } from "../../iv";

const hello = template(`() => {
    # Hello World #
}`);

hello().attach(document.getElementById("main")).render();
