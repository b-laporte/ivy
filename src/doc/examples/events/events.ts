// @@extract: import
import { template } from "../../../iv";

// @@extract: resetCounter
function resetCounter(this: any) {
    this.count = 0;
}

// @@extract: handleKey
function handleKey(e: KeyboardEvent, $api) {
    let v = parseInt(e.key, 10);
    if (!isNaN(v)) {
        $api.count = v;
    }
}

// @@extract: counter
const counter = template(`(count=42, $api) => {
    <div class="counter"  @onkeydown={e => handleKey(e,$api)} >
        <span class="btn" @onclick={() => {$api.count--}}> # - # </>
        <span class="val" @ondblclick={resetCounter.bind($api)} tabIndex=0 > #{count}# </>
        <span class="btn" 
            @onclick(listener={=>$api.count++} options={{capture:true}}) 
        > # + # </>
    </>
}`);

// @@extract: instantiation
counter().attach(document.body).render();
counter().attach(document.body).render({ count: 18 });
