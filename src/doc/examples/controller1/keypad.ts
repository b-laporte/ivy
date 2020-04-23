
import { $template, API, Controller } from '../../../iv';
import { IvEventEmitter } from '../../../iv/events';

// example adapted from https://svelte.dev/examples#component-bindings

// @@extract: data-definition
@API class Keypad {
    placeholder: string;            // e.g. <*keypad placeholder="enter your pin"/>
    submitEmitter: IvEventEmitter;  // e.g. <*keypad @onsubmit={evt=>foo(evt.data)}
}

// @@extract: controller
@Controller class KeypadCtl {
    $api: Keypad;    // public api
    value: string = ""; // private state

    select(n: number) {
        // called when a number button is pressed
        this.value += n;
    }
    clear() {
        // called when the clear button is pressed
        this.value = "";
    }
    submit() {
        // called when the submit button is pressed
        this.$api.submitEmitter.emit(this.value);
    }
    viewValue() {
        // return the text that will be displayed above the keypad
        return this.value ? this.value.replace(/\d(?!$)/g, '•') : this.$api.placeholder;
    }
}

// @@extract: template
export const keypad = $template`($:KeypadCtl) => {
    <div class="keypad">
        <div class="pin" style={"color:" + ($.value ? '#333' : '#ccc')}> 
            {$.viewValue()}
        </div>
        <div class="pad">
            $for (let i=1;10>i;i++) {
                <button @onclick={=>$.select(i)}> {i} </>
            }
            <button disabled={$.value? undefined : true} 
                @onclick={=>$.clear()}
            > clear </>
            <button @onclick={=>$.select(0)}> 0 </>
            <button disabled={$.value? undefined : true} 
                @onclick={=>$.submit()}
            > submit </>
        </>
    </>
}`;
