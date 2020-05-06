// @@extract: import
import { $template } from "../../../iv";

// @@extract: resetCounter
function resetCounter(this: { count: number }) {
    this.count = 0;
}

// @@extract: handleKey
function handleKey(e: KeyboardEvent, api: { count: number }) {
    let v = parseInt(e.key, 10);
    if (!isNaN(v)) {
        api.count = v;
    }
}

// @@extract: counter
const counter = $template`(count=42, $api) => {
    // @@extract: handler1
    <div class="counter"  @onkeydown={e => handleKey(e,$api)} >
        // @@extract: handler2
        <span class="btn" @onclick={() => {$api.count--}}> - </>
        // @@extract: handler3
        <span class="val" @ondblclick={resetCounter.bind($api)} tabIndex=0 > {count} </>
        // @@extract: handler4
        <span class="btn" @onclick(listener={=>$api.count++} options={{capture:true}})> + </>
    // @@extract: counter-end
    </>
}`;

// @@extract: instantiation
counter().attach(document.getElementById("col1")).render();
counter().attach(document.getElementById("col2")).render({ count: 18 });
