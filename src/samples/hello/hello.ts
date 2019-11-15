require('./index.html'); // webpack dependency
import { template } from "../../iv";

const hello = template(`(name:string) => {
    # Hello {name} #
}`);

hello().attach(document.body).render({ name: "World" });
