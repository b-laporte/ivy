import { template } from "../../../iv";

const hello = template(`(name:string) => {
    <div class="hello">
        # Hello {name} #
    </div>
}`);

hello().attach(document.body).render({ name: "World" });
