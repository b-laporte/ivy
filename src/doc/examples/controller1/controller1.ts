import { $template } from '../../../iv';
import { keypad } from './keypad';

// @@extract: main
// example adapted from https://svelte.dev/examples#component-bindings
const main = $template`(message="", $) => {
    <*keypad placeholder="enter your pin" 
        @onsubmit={e=>$.message="Last submission: "+e.data}
    />
    <div class="logs"> {message} </>
}`;

main().attach(document.body).render();
