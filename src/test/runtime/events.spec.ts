import * as assert from 'assert';
import { template } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

describe('Event handlers', () => {
    let body: ElementNode, index = 0, lastEvent: any = null;

    beforeEach(() => {
        body = reset();
        index = 0;
        lastEvent = null;
    });

    function doSomething(e) {
        index++;
        lastEvent = e;
    }

    const panel = template(`(type, $content) => {
        <div class={type}>
            # Panel #
            <div @content={$content}/>
        </div>
    }`);

    it("can be called on elements", function () {
        const tpl = template(`() => {
            <div class="main" click(e)={doSomething(e)}>
                # Click me #
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();

        assert.equal(index, 0, "index=0 before click");
        body.childNodes[0].click();
        assert.equal(index, 1, "index=1 after click");
        body.childNodes[0].click();
        assert.equal(index, 2, "index=2 after 2nd click");
        assert.equal(lastEvent.type, "click", "event properly passed");
    });

    it("can be defined multiple times", function () {
        let lastType = "";
        function doSomethingElse(type) {
            lastType = type;
        }

        const tpl = template(`() => {
            <div class="main" click(e)={doSomething(e)} click(x)={doSomethingElse(x.type)}>
                # Click me #
            </div>
        }`);

        let t = getTemplate(tpl, body).refresh();

        assert.equal(index, 0, "index=0 before click");
        assert.equal(lastType, "", "lastType is empty at init");
        body.childNodes[0].click();
        assert.equal(index, 1, "index=1 after click");
        assert.equal(lastType, "click", "doSomethingElse was called");
    });

    it("can be defined in deferred content", function () {
        const tpl = template(`() => {
            <$panel type="info">
                <div class="main" click(e)={doSomething(e)}>
                    # Click me #
                </div>
            </$panel>
        }`);

        let t = getTemplate(tpl, body).refresh(), mainDiv = body.childNodes[0].childNodes[1].childNodes[0];
        // console.log(stringify(t));
        assert.equal(index, 0, "index=0 before click");
        mainDiv.click();
        assert.equal(index, 1, "index=1 after click");
        mainDiv.click();
        assert.equal(index, 2, "index=2 after 2nd click");
        assert.equal(lastEvent.type, "click", "event properly passed");
    });

    it("should support element creation/removal", function () {
        const tpl = template(`(condition) => {
            if (condition) {
                <div class="main" click(e)={doSomething(e)}>
                    # Click me #
                </div>
            }
        }`);

        let t = getTemplate(tpl, body).refresh({condition:true}), mainDiv = body.childNodes[0];
        assert.equal(index, 0, "index=0 before click");
        mainDiv.click();
        assert.equal(index, 1, "index=1 after click");
        
        t.refresh({condition:false});
        assert.equal(body.childNodes[0].$uid, "C2", "body is empty");

        t.refresh({condition:true});
        mainDiv.click();
        assert.equal(index, 2, "index=2 after 2nd click");
    });
});
