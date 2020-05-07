import { $template } from '../../../iv';
import { keypad } from './keypad';

// @@extract: main
// example adapted from https://svelte.dev/examples#component-bindings
const main = $template`(pin="1234", message="", $api) => {
    <*keypad value={=$api.pin}
        @onsubmit={e=>$api.message="Last submission: "+e.data}
    />
    <div class="pin"> 
        <span class="value"> Keypad value: {pin? pin : "[empty]"} </>
        <span class="reset" @onclick={=>$api.pin="123"} title="reset to '123'"> change </>
    </div>
    <div class="logs"> {message} </>
}`;

main().attach(document.body).render();
