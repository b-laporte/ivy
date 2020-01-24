// @@extract: import
import { template, Controller, API } from '../../../iv';
import { IvTemplate } from '../../../iv/types';

// @@extract: controller
@API class ListApi {
    itemsList: string[];
}

@Controller class ListCtl {
    $api: ListApi;
    $template: IvTemplate;
    nextIdx = -1;

    focus3rd() {
        const li = this.$template.query("#third");
        if (li) {
            li.focus();
        }
    }

    focusNext() {
        this.nextIdx++;
        // true parameter: query all items
        const lis = this.$template.query("#item", true);
        if (lis) {
            if (this.nextIdx >= lis.length) {
                this.nextIdx = 0;
            }
            lis[this.nextIdx].focus();
        }
    }
}

// @@extract: template
const list = template(`($:ListCtl) => {
    <div class="commands">
        <button @onclick={=>$.focus3rd()}> # focus 3rd # </>
        <button @onclick={=>$.focusNext()}> # focus next # </>
    </>
    <ul>
        let count=0;
        for (let name of $.$api.itemsList) {
            count++;
            <li #item #third={count===3} tabindex=0> # {name} # </>
        }
    </>
}`);

// @@extract: main
const main = template(`(title:string, nameList:string[], $template:IvTemplate) => {
    <div class="commands">
        <button @onclick={=>$template.query("#title").focus()}> # focus title # </>
    </>
    <h1 #title tabindex=0> # {title} # </h1>
    <*list itemsList={nameList}/>
}`);

main().attach(document.body)
    .render({
        title: "The Simpsons",
        nameList: ["Homer", "Marge", "Bart", "Lisa", "Maggie"]
    });

