// @@extract: import
import { template, Controller, API } from '../../../iv';
import { IvTemplate, IvContent } from '../../../iv/types';

// @@extract: item-component
@API class ItemApi {
    $content: IvContent;
    focus: () => void;
}

@Controller class ItemCtl {
    $api: ItemApi;
    $template: IvTemplate;

    $init() {
        this.$api.focus = () => {
            let root = this.$template.query("#root");
            if (root) {
                root.focus();
            }
        }
    }
}

const item = template(`($:ItemCtl) => {
    <li #root tabindex=0 @content={$.$api.$content}/>
}`);

// @@extract: main
const main = template(`(title:string, nameList:string[], $template:IvTemplate) => {
    <div class="commands">
        <div class = "lbl"> # Click on a button to focus one of elements below # </>
        <button @onclick={=>focusTitle($template)}> # title # </>
        <button @onclick={=>focus3rd($template)}> # 3rd item # </>
        <button @onclick={=>focusNext($template)}> # next item # </>
    </>
    <h1 #title tabindex=0> # {title} # </h1>
    <ul>
        let count=0;
        for (let name of nameList) {
            count++;
            <*item #item #third={count===3}> # {name} # </>
        }
    </>
}`);

// first instance
main().attach(document.body)
    .render({
        title: "The Simpsons",
        nameList: ["Homer", "Marge", "Bart", "Lisa", "Maggie"]
    });
// second instance
main().attach(document.body)
    .render({
        title: "The Looney Tunes",
        nameList: ["Bugs Bunny", "Daffy Duck", "Porky Pig", "Elmer Fudd", "Taz"]
    });

// @@extract: actions
function focusTitle(tpl: IvTemplate) {
    const h1 = tpl.query("#title");
    if (h1) {
        h1.focus();
    }
}

function focus3rd(tpl: IvTemplate) {
    const li = tpl.query("#third");
    if (li) {
        li.focus();
    }
}

let nextIdx = -1;
function focusNext(tpl: IvTemplate) {
    nextIdx++;
    // true parameter: query all items
    const lis = tpl.query("#item", true);
    if (lis) {
        if (nextIdx >= lis.length) {
            nextIdx = 0;
        }
        lis[nextIdx].focus();
    }
}
