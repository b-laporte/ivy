import { template } from '../../../iv';
import { keypad } from './keypad';

// @@extract: main
// example adapted from https://svelte.dev/examples#component-bindings
const main = template(`(pin="", message="", $api) => {
    <*keypad value={=$api.pin}
        @onsubmit={e=>$api.message="Last submission: "+e.data}
    />
    <div class="pin"> 
        # Keypad value: {pin? pin : "[empty]"}# 
    </div>
    <div class="logs"> #{message}# </>
}`);

main().attach(document.body).render({pin:"1234"});
