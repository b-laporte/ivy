
import { $template, API, Controller, io } from '../../../iv';
import { IvEventEmitter } from '../../../iv/events';


// example adapted from https://svelte.dev/examples#component-bindings
// @@extract: controller
@API class Keypad {
    @io value: string;               // e.g. <*keypad value={=foo.bar}/>
    submitEmitter: IvEventEmitter;  // e.g. <*keypad @onsubmit={evt=>foo(evt.data)}
}

@Controller class KeypadCtl {
    $api: Keypad;       // public api

    select(n: number) {
        // called when a number button is pressed
        this.$api.value += n;
    }
    clear() {
        // called when the clear button is pressed
        this.$api.value = "";
    }
    submit() {
        // called when the submit button is pressed
        this.$api.submitEmitter.emit(this.$api.value);
    }
}

// @@extract: template
export const keypad = $template`($:KeypadCtl, $api) => {
    <div class="keypad">
        $for (let i=1;10>i;i++) {
            <button @onclick={=>$.select(i)}> {i} </>
        }
        <button disabled={$api.value? undefined : true} 
            @onclick={=>$.clear()}
        > clear </>
        <button @onclick={=>$.select(0)}> 0 </>
        <button disabled={$api.value? undefined : true} 
            @onclick={=>$.submit()}
        > submit </>
    </>
}`;
