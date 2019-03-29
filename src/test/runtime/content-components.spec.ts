import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

// Components with content
describe('Content Components', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    let panel = template(`(type, $content) => {
        <div class={type}>
            # Panel #
            <div @content={$content}/>
        </div>
    }`);

    xit("can project content through elements", function () {
        let tpl = template(`(message) => {
            <div class="main">
                <$panel type="important">
                    <div> # Message: {message} # </div>
                </>
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="main">
                    HERE
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    // force template refresh if content changed (cf. last Refresh?) -> cf. instructions (no instruction = no refresh!)
    // todo: $content projected twice
});
