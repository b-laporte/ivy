require('./index.html'); // webpack dependency
import { template, API } from "../../iv";
import { Data, changeComplete } from '../../trax';

@Data class Item {
    text: string;
}
@API class ListState {
    msg: string;
    list: Item[];
}

const list = template(`(state:ListState) => {
    let msg = state.msg, list = state.list;
    <div>
        <p># {msg} #</p>
        for (let i=0;list.length>i;i++) {
            let obj = list[i];
            <div title={msg + i}>
                <span [className]={msg}> # { obj.text } # </span>
                <span [className]="baz"> # one # </span>
                <span [className]="qux"> # two # </span>
                <div>
                    <span [className]="qux"> # three # </span>
                    <span [className]="qux"> # four # </span>
                    <span [className]="baz"> # five # </span>
                    <div>
                        <span [className]="qux"> # six # </span>
                        <span [className]="baz"> # seven # </span>
                        <span [className]={msg}> # eight # </span>
                    </>
                </>
            </>
        }
    </>
}`);

// initialize state
const state = new ListState();
state.msg = "hello";
let itm: Item, ls = state.list;
for (let i = 0; 1000 > i; i++) {
    itm = new Item();
    itm.text = 'foobar' + i;
    ls[i] = itm;
}

const p = performance.now();

list().attach(document.getElementById("main")).render({ state });
console.log(`mount: ${(performance.now() - p).toFixed(2)}ms`);

const patchResults: any[] = [];

async function runPatch() {
    const s = performance.now();
    state.msg = state.msg === 'hello' ? 'bye' : 'hello';
    state.list[0].text = state.msg;
    await changeComplete(state);
    patchResults.push(performance.now() - s)
}

async function run() {
    console.log("version with [className]=={msg}")
    const count = 100;

    for (let i = 0; i < count; i++) {
        await runPatch();
        await new Promise(r => requestAnimationFrame(r));
    }

    let fastest = Infinity, first = true;
    const total = patchResults.reduce((all, cur) => {
        if (!first && cur < fastest) {
            fastest = cur;
        }
        first = false;
        return all + cur;
    }, 0)

    console.log(`${count} runs average: ${(total / count).toFixed(2)}ms`);
    console.log(`fastest run: ${fastest.toFixed(2)}ms`);
}
run();

