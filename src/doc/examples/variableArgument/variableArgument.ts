import { IvTemplate } from '../../../iv/types';
import { template } from "../../../iv";

const pi = 3.14159265359;

// @@extract: main
const main = template(`(p = pi) => {
    <div> # {p} # </>
}`);

main().attach(document.body).render();
