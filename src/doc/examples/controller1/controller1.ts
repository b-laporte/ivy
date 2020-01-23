import { template } from '../../../iv';
import { keypad } from './keypad';

// @@extract: main
// example adapted from https://svelte.dev/examples#component-bindings
const main = template(`(message="", $api) => {
    <*keypad placeholder="enter your pin" 
        @onsubmit={e=>$api.message="Last submission: "+e.data}
    />
    <div class="logs"> #{message}# </>
}`, keypad);

main().attach(document.body).render();
