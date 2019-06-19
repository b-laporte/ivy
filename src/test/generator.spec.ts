// iv:ignore
import { body, statics, test } from './utils';
import * as assert from 'assert';

describe('Code generator', () => {

    it("should support static text nodes", async function () {
        assert.equal(await body.template(`() => {
            # Hello World #
        }`), `
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, " Hello World ", 0);
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`() => {
            # Hello #
            # World #
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, " Hello ", 0);
            ζtxt(ζ, ζc, 0, 2, 1, " World ", 0);
            ζend(ζ, ζc);
        `, '2');
    });

    it("should support dynamic text nodes and expressions", async function () {
        assert.equal(await body.template(`(name) => {
            # Hello {name} #
        }`), `
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        `, '1');

        assert.deepEqual(await statics.template(`(name) => {
            # Hello {name} #
        }` ), [
                'ζs0 = {}',
                'ζs1 = [" Hello ", "", " "]'
            ], '2');

        assert.equal(await body.template(`(name) => {
            # Hello {name} #
            # {name+1} {::name+2} #
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, ζs1, 1, ζe(ζ, 0, name));
            ζtxt(ζ, ζc, 0, 2, 1, ζs2, 2, ζe(ζ, 1, name+1), ζo(ζ, 0, ζc? name+2 : ζu));
            ζend(ζ, ζc);
        `, '3');

        assert.deepEqual(await statics.template(`(name) => {
            # Hello {name}#
            # {name+1} {::name+2} #
        }` ), [
                'ζs0 = {}',
                'ζs1 = [" Hello ", ""]',
                'ζs2 = [" ", "", " ", "", " "]'
            ], '4');
    });

    it("should support dynamic text nodes in fragments", async function () {
        assert.equal(await body.template(`(name) => {
            <div>
                <!> 
                    # Hello {name} #
                    <span> # {name} # </span>
                </!>
            </div>
        }`), `
            let ζc = ζinit(ζ, ζs0, 5);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζfra(ζ, ζc, 1, 1);
            ζtxt(ζ, ζc, 0, 2, 2, ζs1, 1, ζe(ζ, 0, name));
            ζelt(ζ, ζc, 3, 2, "span", 1);
            ζtxt(ζ, ζc, 0, 4, 3, ζs2, 1, ζe(ζ, 1, name));
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support element nodes", async function () {
        let t1 = await test.template(`() => {
            <div class="main">
                <span class="foo" enabled=true col = 2> # Hello # </span>
                <span> # World # </span>
            </>
        }`);
        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 5);
            ζelt(ζ, ζc, 0, 0, "div", 1, ζs1);
            ζelt(ζ, ζc, 1, 1, "span", 1, ζs2);
            ζtxt(ζ, ζc, 0, 2, 2, " Hello ", 0);
            ζelt(ζ, ζc, 3, 1, "span", 1);
            ζtxt(ζ, ζc, 0, 4, 2, " World ", 0);
            ζend(ζ, ζc);
        `, '1a');
        assert.deepEqual(t1.statics, [
            'ζs0 = {}',
            'ζs1 = ["class", "main"]',
            'ζs2 = ["class", "foo", "enabled", true, "col", 2]'
        ], '1b');

        let t2 = await test.template(`() => {
            <div [className]="main">
                <span class="foo" [enabled]=true [col] = 2> # Hello # </span>
                <section> # World # </section>
            </>
        }`);
        assert.equal(t2.body, `
            let ζc = ζinit(ζ, ζs0, 5);
            ζelt(ζ, ζc, 0, 0, "div", 1, ζu, ζs1);
            ζelt(ζ, ζc, 1, 1, "span", 1, ζs2, ζs3);
            ζtxt(ζ, ζc, 0, 2, 2, " Hello ", 0);
            ζelt(ζ, ζc, 3, 1, "section", 1);
            ζtxt(ζ, ζc, 0, 4, 2, " World ", 0);
            ζend(ζ, ζc);
        `, '2a');
        assert.deepEqual(t2.statics, [
            'ζs0 = {}',
            'ζs1 = ["className", "main"]',
            'ζs2 = ["class", "foo"]',
            'ζs3 = ["enabled", true, "col", 2]'
        ], '2b');
    });

    it("should support orphan attributes", async function () {
        let t1 = await test.template(`() => {
            <div disabled/>
        }`);
        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 1);
            ζelt(ζ, ζc, 0, 0, "div", 0, ζs1);
            ζend(ζ, ζc);
        `, '1a');
        assert.deepEqual(t1.statics, [
            'ζs0 = {}',
            'ζs1 = ["disabled", true]'
        ], '1b');
    });

    it("should support dynamic attributes", async function () {
        assert.equal(await body.template(`(name) => {
            <div title={exp()+123}>
                <span class={getClass()}/>
            </div>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζatt(ζ, 0, 0, "title", ζe(ζ, 0, exp()+123));
            ζelt(ζ, ζc, 1, 1, "span", 0);
            ζatt(ζ, 0, 1, "class", ζe(ζ, 1, getClass()));
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support dynamic properties", async function () {
        assert.equal(await body.template(`(name) => {
            <div [title]={exp()+123}>
                <span [className]={::getClass()}/>
            </div>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζpro(ζ, 0, 0, "title", ζe(ζ, 0, exp()+123));
            ζelt(ζ, ζc, 1, 1, "span", 0);
            ζpro(ζ, 0, 1, "className", ζo(ζ, 0, ζc? getClass() : ζu));
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support fragments", async function () {
        let t = await test.template(`() => {
            <!>
                # fragment 1 #
                <!>
                    <div> # fragment 2 # </div>
                </>
            </>
        }`);
        assert.equal(t.body, `
            let ζc = ζinit(ζ, ζs0, 5);
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, " fragment 1 ", 0);
            ζfra(ζ, ζc, 2, 1);
            ζelt(ζ, ζc, 3, 2, "div", 1);
            ζtxt(ζ, ζc, 0, 4, 3, " fragment 2 ", 0);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support js statements", async function () {
        assert.equal(await body.template(`() => {
            let x = 42;
            # Something #
            x++;
            let bar = { a:"xyz"};
            # Something else #
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            let x = 42;
            ζtxt(ζ, ζc, 0, 1, 1, " Something ", 0);
            x++;
            let bar = { a:"xyz"};
            ζtxt(ζ, ζc, 0, 2, 1, " Something else ", 0);
            ζend(ζ, ζc);
        `, 'statements first and embedded');

        assert.equal(await body.template(`() => {
            # Something #
            do {
                callSomething();
            } while (test);
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, " Something ", 0);
            do {
                callSomething();
            } while (test);
            ζend(ζ, ζc);
        `, 'statements last');
    });

    it("should support js blocks", async function () {
        assert.equal(await body.template(`(name) => {
            if (test) {
                # Hello {name} #
            }
            # \\(end) #
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζcnt(ζ, ζc, 1, 1, 1);
            if (test) {
                ζ1 = ζview(ζ, 0, 1, 1, ++ζi1);
                ζc1 = ζ1.cm;
                ζtxt(ζ1, ζc1, 0, 0, 0, ζs1, 1, ζe(ζ1, 0, name));
                ζend(ζ1, ζc1);
            }
            ζtxt(ζ, ζc, 0, 2, 1, " \\(end) ", 0);
            ζend(ζ, ζc, ζs2);
        `, 'first position');

        assert.deepEqual(await statics.template(`(name) => {
            if (test) {
                # Hello {name} #
            }
            # \\(end) #
        }` ), [
                'ζs0 = {}',
                'ζs1 = [" Hello ", "", " "]',
                'ζs2 = [1]'
            ], 'first position statics');

        assert.equal(await body.template(`(name) => {
            if (test) {
                # A {name} #
            } else {
                # B {name} #
            }
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζcnt(ζ, ζc, 1, 1, 1);
            ζcnt(ζ, ζc, 2, 1, 1);
            if (test) {
                ζ1 = ζview(ζ, 0, 1, 1, ++ζi1);
                ζc1 = ζ1.cm;
                ζtxt(ζ1, ζc1, 0, 0, 0, ζs1, 1, ζe(ζ1, 0, name));
                ζend(ζ1, ζc1);
            } else {
                ζ2 = ζview(ζ, 0, 2, 1, ++ζi2);
                ζc2 = ζ2.cm;
                ζtxt(ζ2, ζc2, 0, 0, 0, ζs2, 1, ζe(ζ2, 0, name));
                ζend(ζ2, ζc2);
            }
            ζend(ζ, ζc, ζs3);
        `, 'all / if+else');

        assert.deepEqual(await statics.template(`(name) => {
            if (test) {
                # A {name} #
            } else {
                # B {name} #
            }
        }`), [
                'ζs0 = {}',
                'ζs1 = [" A ", "", " "]',
                'ζs2 = [" B ", "", " "]',
                'ζs3 = [1, 2]'
            ], 'all / if+else statics');

        assert.equal(await body.template(`(name) => {
            # hello #
            do {
                let x=123;
                # A {name} #
            } while (test)
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, " hello ", 0);
            ζcnt(ζ, ζc, 2, 1, 1);
            do {
                ζ1 = ζview(ζ, 0, 2, 2, ++ζi1);
                ζc1 = ζ1.cm;
                ζfra(ζ1, ζc1, 0, 0);
                let x=123;
                ζtxt(ζ1, ζc1, 0, 1, 1, ζs1, 1, ζe(ζ1, 0, name));
                ζend(ζ1, ζc1);
            } while (test)
            ζend(ζ, ζc, ζs2);
        `, 'last + js Statements first & last');

        assert.equal(await body.template(`(name) => {
            if (a) {
                # A {name} #
            }
            let x=1;
            if (b) {
                # B {name} #
            }
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζcnt(ζ, ζc, 1, 1, 1);
            ζcnt(ζ, ζc, 2, 1, 1);
            if (a) {
                ζ1 = ζview(ζ, 0, 1, 1, ++ζi1);
                ζc1 = ζ1.cm;
                ζtxt(ζ1, ζc1, 0, 0, 0, ζs1, 1, ζe(ζ1, 0, name));
                ζend(ζ1, ζc1);
            } let x=1;
            if (b) {
                ζ2 = ζview(ζ, 0, 2, 1, ++ζi2);
                ζc2 = ζ2.cm;
                ζtxt(ζ2, ζc2, 0, 0, 0, ζs2, 1, ζe(ζ2, 0, name));
                ζend(ζ2, ζc2);
            }
            ζend(ζ, ζc, ζs3);
        `, 'series of block & statements');

        assert.equal(await body.template(`(name) => {
            <span/>
            if (a) {
                # A {name} #
                <div/>
            }
            <section/>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 4);
            ζfra(ζ, ζc, 0, 0);
            ζelt(ζ, ζc, 1, 1, "span", 0);
            ζcnt(ζ, ζc, 2, 1, 1);
            if (a) {
                ζ1 = ζview(ζ, 0, 2, 3, ++ζi1);
                ζc1 = ζ1.cm;
                ζfra(ζ1, ζc1, 0, 0);
                ζtxt(ζ1, ζc1, 0, 1, 1, ζs1, 1, ζe(ζ1, 0, name));
                ζelt(ζ1, ζc1, 2, 1, "div", 0);
                ζend(ζ1, ζc1);
            }
            ζelt(ζ, ζc, 3, 1, "section", 0);
            ζend(ζ, ζc, ζs2);
        `, 'embedded & multiple child nodes');
        assert.deepEqual(await statics.template(`(name) => {
            <span/>
            if (a) {
                # A {name} #
                <div/>
            }
            <section/>
        }` ), [
                'ζs0 = {}',
                'ζs1 = [" A ", "", " "]',
                'ζs2 = [2]'
            ], 'embedded & multiple child nodes statics');

        assert.equal(await body.template(`(name) => {
            if (a) {
                if (b) {
                    <span/>
                }
                <div/>
            }
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 1);
            ζcnt(ζ, ζc, 0, 0, 1);
            if (a) {
                ζi2 = 0;
                ζ1 = ζview(ζ, 0, 0, 3, ++ζi1);
                ζc1 = ζ1.cm;
                ζfra(ζ1, ζc1, 0, 0);
                ζcnt(ζ1, ζc1, 1, 1, 1);
                if (b) {
                    ζ2 = ζview(ζ1, 0, 1, 1, ++ζi2);
                    ζc2 = ζ2.cm;
                    ζelt(ζ2, ζc2, 0, 0, "span", 0);
                    ζend(ζ2, ζc2);
                }
                ζelt(ζ1, ζc1, 2, 1, "div", 0);
                ζend(ζ1, ζc1, ζs2);
            }
            ζend(ζ, ζc, ζs1);
        `, 'last');
        assert.deepEqual(await statics.template(`(name) => {
            if (a) {
                if (b) {
                    <span/>
                }
                <div/>
            }
        }` ), [
                'ζs0 = {}',
                'ζs1 = [0]',
                'ζs2 = [1]'
            ], 'last statics');
    });

    it("should support js blocks in elements and fragments", async function () {
        assert.equal(await body.template(`() => {
            <div>
                # first #
                if (condition) {
                    <span/>
                }
            </div>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζtxt(ζ, ζc, 0, 1, 1, " first ", 0);
            ζcnt(ζ, ζc, 2, 1, 1);
            if (condition) {
                ζ1 = ζview(ζ, 0, 2, 1, ++ζi1);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "span", 0);
                ζend(ζ1, ζc1);
            }
            ζend(ζ, ζc, ζs1);
        `, '1');

        assert.equal(await body.template(`() => {
            <div>
                <!>
                    if (condition) {
                        <span/>
                    }
                </>
                if (condition) {
                    <span/>
                }
            </div>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 4);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζfra(ζ, ζc, 1, 1);
            ζcnt(ζ, ζc, 2, 2, 1);
            if (condition) {
                ζ1 = ζview(ζ, 0, 2, 1, ++ζi1);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "span", 0);
                ζend(ζ1, ζc1);
            }
            ζcnt(ζ, ζc, 3, 1, 1);
            if (condition) {
                ζ2 = ζview(ζ, 0, 3, 1, ++ζi2);
                ζc2 = ζ2.cm;
                ζelt(ζ2, ζc2, 0, 0, "span", 0);
                ζend(ζ2, ζc2);
            }
            ζend(ζ, ζc, ζs1);
        `, '2');
    });

    it("should support js blocks in js blocks", async function () {
        assert.equal(await body.template(`(condition1, condition2) => {
            <div>
                if (condition1) {
                    <span/>
                    if (condition2) {
                        <div/>
                    }
                }
            </div>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcnt(ζ, ζc, 1, 1, 1);
            if (condition1) {
                ζi2 = 0;
                ζ1 = ζview(ζ, 0, 1, 3, ++ζi1);
                ζc1 = ζ1.cm;
                ζfra(ζ1, ζc1, 0, 0);
                ζelt(ζ1, ζc1, 1, 1, "span", 0);
                ζcnt(ζ1, ζc1, 2, 1, 1);
                if (condition2) {
                    ζ2 = ζview(ζ1, 0, 2, 1, ++ζi2);
                    ζc2 = ζ2.cm;
                    ζelt(ζ2, ζc2, 0, 0, "div", 0);
                    ζend(ζ2, ζc2);
                }
                ζend(ζ1, ζc1, ζs2);
            }
            ζend(ζ, ζc, ζs1);
        `, '1');

        assert.equal(await body.template(`(condition1, condition2, condition3) => {
            <div>
                if (condition1) {
                    <span/>
                    if (condition2) {
                        <div/>
                    }
                    if (condition3) {
                        <div/>
                    }
                }
            </div>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζi3 = 0, ζ3, ζc3, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcnt(ζ, ζc, 1, 1, 1);
            if (condition1) {
                ζi2 = ζi3 = 0;
                ζ1 = ζview(ζ, 0, 1, 4, ++ζi1);
                ζc1 = ζ1.cm;
                ζfra(ζ1, ζc1, 0, 0);
                ζelt(ζ1, ζc1, 1, 1, "span", 0);
                ζcnt(ζ1, ζc1, 2, 1, 1);
                ζcnt(ζ1, ζc1, 3, 1, 1);
                if (condition2) {
                    ζ2 = ζview(ζ1, 0, 2, 1, ++ζi2);
                    ζc2 = ζ2.cm;
                    ζelt(ζ2, ζc2, 0, 0, "div", 0);
                    ζend(ζ2, ζc2);
                } if (condition3) {
                    ζ3 = ζview(ζ1, 0, 3, 1, ++ζi3);
                    ζc3 = ζ3.cm;
                    ζelt(ζ3, ζc3, 0, 0, "div", 0);
                    ζend(ζ3, ζc3);
                }
                ζend(ζ1, ζc1, ζs2);
            }
            ζend(ζ, ζc, ζs1);
        `, '2');
    });

    it("should support components with no content", async function () {
        let t1 = await test.template(`() => {
            <*alert class="important" position="bottom"/>
        }`);

        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, alert), 1, ζs1);
            ζend(ζ, ζc);
        `, '1a');

        assert.deepEqual(t1.statics, [
            'ζs0 = {}',
            'ζs1 = ["class", "important", "position", "bottom"]'
        ], '1b');

        // with dynamic params
        let t2 = await test.template(`() => {
            <*b.section position={getPosition()} msg={myMessage} type="big" important/>
        }`);
        assert.equal(t2.body, `
            let ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, b.section), 0, ζs1);
            ζpar(ζ, 0, 0, "position", ζe(ζ, 1, getPosition()));
            ζpar(ζ, 0, 0, "msg", ζe(ζ, 2, myMessage));
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '2a');
        assert.deepEqual(t2.statics, [
            'ζs0 = {}',
            'ζs1 = ["type", "big", "important", true]'
        ], '2b');
    });

    it("should support event handlers on elements", async function () {
        assert.equal(await body.template(`(name) => {
            <div click(e)={doSomething()} mousemove( x, y )={doSomethingElse(y,x)}>
                # Click {name} #
            </div>
            }`), `
            let ζc = ζinit(ζ, ζs0, 4);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζevt(ζ, ζc, 1, 0, "click", function (e) {doSomething()});
            ζevt(ζ, ζc, 2, 0, "mousemove", function (x,y) {doSomethingElse(y,x)});
            ζtxt(ζ, ζc, 0, 3, 1, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support components with content & no param nodes", async function () {
        assert.equal(await body.template(`() => {
            <*myComponent>
                <span title={getTitle()}/>
            </>
            }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, myComponent), 0);
            ζ1 = ζviewD(ζ, 1, 0, 1, 0, 1);
            ζc1 = ζ1.cm;
            ζeltD(ζ1, ζc1, 0, 0, "span", 0);
            ζattD(ζ1, 1, 0, "title", [0, getTitle()]);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, 'single node + dynamic param');

        assert.equal(await body.template(`() => {
            <*myComponent>
                # hello {name1} #
                <*otherComponent p1={expr()}>
                    # hello {name2} #
                </>
            </>
            }`), `
            let ζ1, ζc1, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, myComponent), 0);
            ζ1 = ζviewD(ζ, 1, 0, 3, 0, 1);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, ζs1, 1, [0, name1]);
            ζcptD(ζ1, ζc1, 1, 2, 1, [1, otherComponent], 0);
            ζparD(ζ1, 1, 2, "p1", [2, expr()]);
            ζ2 = ζviewD(ζ1, 1, 2, 1, 0, 1);
            ζc2 = ζ2.cm;
            ζtxtD(ζ2, ζc2, 1, 0, 0, ζs2, 1, [0, name2]);
            ζendD(ζ2, ζc2);
            ζcallD(ζ1, 2);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, 'multiple nodes & sub-component');
    });

    it("should support js blocks in component content", async function () {
        assert.equal(await body.template(`(foo) => {
            <*cpt>
                # first #
                if (condition) {
                    <span class={foo} title={foo+1}/>
                }
            </*cpt>
            }`), `
            let ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζi2 = 0;
            ζ1 = ζviewD(ζ, 1, 0, 3, 0, 1);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, " first ", 0);
            ζcntD(ζ1, ζc1, 2, 1, 1);
            if (condition) {
                ζ2 = ζviewD(ζ1, 2, 2, 1, ++ζi2);
                ζc2 = ζ2.cm;
                ζeltD(ζ2, ζc2, 0, 0, "span", 0);
                ζattD(ζ2, 1, 0, "class", [0, foo]);
                ζattD(ζ2, 1, 0, "title", [1, foo+1]);
                ζendD(ζ2, ζc2);
            }
            ζendD(ζ1, ζc1, ζs1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should not create content view for content with single js statements block", async function () {
        let t = await test.template(`() => {
            <span>
                let x=123;
            </span>
            <*foo>
                let bar=foo;
            </>
        }`);

        assert.equal(t.body, `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζelt(ζ, ζc, 1, 1, "span", 1);
            let x=123;
            ζcpt(ζ, ζc, 0, 2, 1, ζe(ζ, 0, foo), 1);
            let bar=foo;
            ζend(ζ, ζc);
        `, '1');

        assert.ok(t.importMap!["ζview"] !== 1, '2');
        assert.ok(t.importMap!["ζviewD"] !== 1, '3');
        assert.ok(t.importMap!["ζendD"] !== 1, '4');
    });

    it("should support $params argument", async function () {
        let t = await test.template(`($params, a, b) => {
            <div class="main">
                # text {$params.a} #
            </>
        }`);

        assert.equal(t.function, `(function () {
        const ζs0 = {}, ζs1 = ["class", "main"], ζs2 = [" text ", "", " "];
        @ζΔD class ζParams {
            ΔΔa: any; @ζΔp() a: any;
            ΔΔb: any; @ζΔp() b: any;
        }
        return ζt(function (ζ, $) {
            let $params = $, a = $["a"], b = $["b"];
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1, ζs1);
            ζtxt(ζ, ζc, 0, 1, 1, ζs2, 1, ζe(ζ, 0, $params.a));
            ζend(ζ, ζc);
        }, 0, ζParams);
        })()` , '1');
    });

    it("should support import re-injection", async function () {
        let t1 = await test.template(`() => {
            <div class="main">
                let x=123;
                # x = {x} #
            </>
        }`);
        assert.deepEqual(t1.importMap, {
            "ζelt": 1, "ζtxt": 1, "ζinit": 1, "ζe": 1, "ζend": 1, "ζt": 1
        }, "t1 imports");

        let t2 = await test.template(`(comp) => {
            <*comp/>
        }`, t1.importMap);
        assert.deepEqual(t2.importMap, {
            "ζelt": 1, "ζtxt": 1, "ζinit": 1, "ζe": 1, "ζend": 1, "ζt": 1, "ζcpt": 1, "ζΔD": 1, "ζΔp": 1
        }, "t2 imports");
    });

    it("should support external Param class definition", async function () {
        let t1 = await test.template(`($params:MyParamClass) => {
            # Hello {$.name} #
        }`);
        assert.equal(t1.function, `(function () {
        const ζs0 = {}, ζs1 = [" Hello ", "", " "];
        return ζt(function (ζ, $) {
            let $params = $;
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, ζs1, 1, ζe(ζ, 0, $.name));
            ζend(ζ, ζc);
        }, 0, MyParamClass);
        })()`, 'simple param class');

        let t2 = await test.template(`($params:MyParamClass, name) => {
            # Hello {name} #
        }`);
        assert.equal(t2.function, `(function () {
        const ζs0 = {}, ζs1 = [" Hello ", "", " "];
        return ζt(function (ζ, $) {
            let $params = $, name = $["name"];
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        }, 0, MyParamClass);
        })()`, 'param class + local variables initialization');
    });

    it("should support built-in @content with expression on fragments", async function () {
        assert.equal(await body.template(`($content) => {
            <div>
                <! @content={$content}/>
            </div>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζfra(ζ, ζc, 1, 1);
            ζins(ζ, 0, 1, ζe(ζ, 0, $content));
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support built-in @content without expression on elements", async function () {
        assert.equal(await body.template(`($content) => {
            <div class="foo" @content/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 1);
            ζelt(ζ, ζc, 0, 0, "div", 0, ζs1);
            ζins(ζ, 0, 0, ζe(ζ, 0, $content));
            ζend(ζ, ζc);
        `, '1');
    });

    /*
        it("should support components with content & param nodes", async function () {
            assert.equal(await body.template(`() => {
                # first #
                <*myComponent>
                    <.header position="top" foo={bar()}/>
                    # some content {baz()} #
                    <.footer type="small"/>
                </>
            }`), `
                if (ζ[0].cm) {
                    ζfrag(ζ, 1, 0);
                    ζtxt(ζ, 2, 1, 0, " first ");
                    ζfrag(ζ, 3, 1, 0, 2);
                    ζfrag(ζ, 4, 3, 4);
                    ζpnode(ζ, 5, 4, 0, "header", ζs0);
                    ζtxt(ζ, 6, 4, 4, ζs1);
                    ζpnode(ζ, 7, 4, 0, "footer", ζs2);
                }
                ζcpt(ζ, 3, 0, ζe(ζ, 0, myComponent), 4, 0);
                ζparam(ζ, 5, 0, "foo", ζe(ζ, 1, bar()));
                ζtxtval(ζ, 6, 4, ζs1, 1, [0, baz()]);
                ζcall(ζ, 3);
                ζend(ζ, 0);
            `, '1');
    
            assert.equal(await body.template(`() => {
                # first #
                <*myComponent>
                    <.header position="top" foo={bar()}>
                        <.title> <b> # Complex {exp()} # </b> </.title>
                        # header content #
                    </>
                    # cpt content {foo()} #
                </>
            }`), `
                if (ζ[0].cm) {
                    ζfrag(ζ, 1, 0);
                    ζtxt(ζ, 2, 1, 0, " first ");
                    ζfrag(ζ, 3, 1, 0, 2);
                    ζfrag(ζ, 4, 3, 4);
                    ζpnode(ζ, 5, 4, 0, "header", ζs0);
                    ζfrag(ζ, 6, 5, 6);
                    ζpnode(ζ, 7, 6, 4, "title");
                    ζelt(ζ, 8, 7, 8, "b");
                    ζtxt(ζ, 9, 8, 8, ζs1);
                    ζtxt(ζ, 10, 6, 6, " header content ");
                    ζtxt(ζ, 11, 4, 4, ζs2);
                }
                ζcpt(ζ, 3, 0, ζe(ζ, 0, myComponent), 4, 0);
                ζparam(ζ, 5, 0, "foo", ζe(ζ, 1, bar()));
                ζtxtval(ζ, 9, 8, ζs1, 1, [0, exp()]);
                ζtxtval(ζ, 11, 4, ζs2, 1, [0, foo()]);
                ζcall(ζ, 3);
                ζend(ζ, 0);
            `, '2');
        });
    
        it("should not create content fragments components with only param nodes and js statements", async function () {
            assert.equal(await body.template(`() => {
                <*foo>
                    <.paramA value="a"/>
                    let bar=foo;
                    <.paramB value={exp(bar)}/>
                </>
            }`), `
                if (ζ[0].cm) {
                    ζfrag(ζ, 1, 0, 0, 2);
                    ζpnode(ζ, 2, 1, 0, "paramA", ζs0);
                    ζpnode(ζ, 3, 1, 0, "paramB");
                }
                ζcpt(ζ, 1, 0, ζe(ζ, 0, foo), 0, 0);
                let bar=foo;
                ζparam(ζ, 3, 0, "value", ζe(ζ, 1, exp(bar)));
                ζcall(ζ, 1);
                ζend(ζ, 0);
            `, '1');
        });
    
        it("should generate the full template function", async function () {
            let t1 = await test.template(`() => {
                <div class="main">
                    <*b.section type="important">
                        <.header> # The big title #</>
                        <span class="content"> # Section content # </>
                    </>
                </>
            }`);
    
            assert.equal(t1.function, `(function () {
            const ζs0 = ["class", "main"], ζs1 = ["type", "important"], ζs2 = ["class", "content"];
            return ζt(function (ζ) {
                if (ζ[0].cm) {
                    ζelt(ζ, 1, 0, 0, "div", ζs0);
                    ζfrag(ζ, 2, 1, 0, 2);
                    ζfrag(ζ, 3, 2, 3);
                    ζpnode(ζ, 4, 3, 0, "header");
                    ζtxt(ζ, 5, 4, 5, " The big title ");
                    ζelt(ζ, 6, 3, 3, "span", ζs2);
                    ζtxt(ζ, 7, 6, 3, " Section content ");
                }
                ζcpt(ζ, 2, 0, ζe(ζ, 0, b.section), 3, 0, ζs1);
                ζcall(ζ, 2);
                ζend(ζ, 0);
            });
            })()` , 'f1');
            assert.deepEqual(t1.importMap, {
                "ζelt": 1, "ζfrag": 1, "ζpnode": 1, "ζtxt": 1, "ζcc": 1, "ζcpt": 1, "ζe": 1, "ζcall": 1, "ζend": 1, "ζt": 1
            }, 'imports 1');
    
            let t2 = await test.template(`(name) => {
                <div class="msg" [title]={"Message for " + name}>
                    # Hello {name} #
                </>
            }`);
            assert.equal(t2.function, `(function () {
            const ζs0 = ["class", "msg"], ζs1 = [" Hello ", "", " "];
            @ζd class ζParams {
                @ζv name;
            }
            return ζt(function (ζ, $) {
                let name = $["name"];
                if (ζ[0].cm) {
                    ζelt(ζ, 1, 0, 0, "div", ζs0);
                    ζtxt(ζ, 2, 1, 0, ζs1);
                }
                ζprop(ζ, 1, 0, "title", ζe(ζ, 0, "Message for " + name));
                ζtxtval(ζ, 2, 0, ζs1, 1, ζe(ζ, 1, name));
                ζend(ζ, 0);
            }, 0, ζParams);
            })()` , 'f2');
            assert.deepEqual(t2.importMap, {
                "ζelt": 1, "ζtxt": 1, "ζcc": 1, "ζe": 1, "ζtxtval": 1, "ζend": 1, "ζprop": 1, "ζv": 1, "ζd": 1, "ζt": 1
            }, 'imports 2');
    
            let t3 = await test.template(`(firstName, lastName) => {
                # Hello {firstName} {::lastName} #
            }`);
            assert.equal(t3.function, `(function () {
            const ζs0 = [" Hello ", "", " ", "", " "];
            @ζd class ζParams {
                @ζv firstName;
                @ζv lastName;
            }
            return ζt(function (ζ, $) {
                let firstName = $["firstName"], lastName = $["lastName"];
                if (ζ[0].cm) {
                    ζtxt(ζ, 1, 0, 0, ζs0);
                }
                ζtxtval(ζ, 1, 0, ζs0, 2, ζe(ζ, 0, firstName), ζo(ζ, 0, ζc? lastName : ζu));
                ζend(ζ, 0);
            }, 0, ζParams);
            })()` , 'f3');
            assert.deepEqual(t3.importMap, {
                "ζtxt": 1, "ζcc": 1, "ζtxtval": 1, "ζe": 1, "ζu": 1, "ζend": 1, "ζo": 1, "ζv": 1, "ζd": 1, "ζt": 1
            }, 'imports 3');
        });
    
        
        */

    it("should support async elements", async function () {
        assert.equal(await body.template(`(msg) => {
            <div>
                <div @async class="foo">
                    # Message: {msg} #
                </div>
            </div>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcnt(ζ, ζc, 1, 1, 3);
            ζasync(ζ, 0, 1, 1, function () {
                ζ1 = ζview(ζ, 0, 1, 2, ++ζi1);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "div", 1, ζs2);
                ζtxt(ζ1, ζc1, 0, 1, 1, ζs3, 1, ζe(ζ1, 0, msg));
                ζend(ζ1, ζc1);
            });
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`(msg) => {
            <div @async=3>
                # Message: {msg} #
            </div>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 1);
            ζcnt(ζ, ζc, 0, 0, 3);
            ζasync(ζ, 0, 0, 3, function () {
                ζ1 = ζview(ζ, 0, 0, 2, ++ζi1);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "div", 1);
                ζtxt(ζ1, ζc1, 0, 1, 1, ζs1, 1, ζe(ζ1, 0, msg));
                ζend(ζ1, ζc1);
            });
            ζend(ζ, ζc);
        `, '2');

        assert.equal(await body.template(`(msg) => {
            <div @async={expr()} click(e)={doSomething(e)}>
                # Message1: {msg} #
            </div>
            # Message2: {msg} #
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζcnt(ζ, ζc, 1, 1, 3);
            ζasync(ζ, 0, 1, ζe(ζ, 0, expr()), function () {
                ζ1 = ζview(ζ, 0, 1, 3, ++ζi1);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "div", 1);
                ζevt(ζ1, ζc1, 1, 0, "click", function (e) {doSomething(e)});
                ζtxt(ζ1, ζc1, 0, 2, 1, ζs1, 1, ζe(ζ1, 0, msg));
                ζend(ζ1, ζc1);
            });
            ζtxt(ζ, ζc, 0, 2, 1, ζs2, 1, ζe(ζ, 1, msg));
            ζend(ζ, ζc);
        `, '3');
    });

    it("should support async fragments", async function () {
        assert.equal(await body.template(`(msg) => {
            <div>
                <! @async={expr()}>
                    # Message: {msg} #
                </>
            </div>
        }`), `
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcnt(ζ, ζc, 1, 1, 3);
            ζasync(ζ, 0, 1, ζe(ζ, 0, expr()), function () {
                ζ1 = ζview(ζ, 0, 1, 2, ++ζi1);
                ζc1 = ζ1.cm;
                ζfra(ζ1, ζc1, 0, 0);
                ζtxt(ζ1, ζc1, 0, 1, 1, ζs1, 1, ζe(ζ1, 0, msg));
                ζend(ζ1, ζc1);
            });
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support async components", async function () {
        assert.equal(await body.template(`(msg) => {
            <div>
                <*section title={msg} @async>
                    # Message: {msg} #
                </>
            </div>
        }`), `
            let ζ1, ζc1, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcnt(ζ, ζc, 1, 1, 3);
            ζasync(ζ, 0, 1, 1, function () {
                ζ1 = ζview(ζ, 0, 1, 1, 0, 1);
                ζc1 = ζ1.cm;
                ζcpt(ζ1, ζc1, 0, 0, 0, ζe(ζ1, 0, section), 0);
                ζpar(ζ1, 0, 0, "title", ζe(ζ1, 1, msg));
                ζ2 = ζviewD(ζ1, 1, 0, 1, 0, 1);
                ζc2 = ζ2.cm;
                ζtxtD(ζ2, ζc2, 1, 0, 0, ζs1, 1, [0, msg]);
                ζendD(ζ2, ζc2);
                ζcall(ζ1, 0);
                ζend(ζ1, ζc1);
            });
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support async in component content", async function () {
        assert.equal(await body.template(`(msg) => {
            <*cpt>
                # {msg} #
                <div @async>
                    # other text #
                </div>
            </>
        }`), `
            let ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζi2 = 0;
            ζ1 = ζviewD(ζ, 1, 0, 3, 0, 1);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, ζs1, 1, [0, msg]);
            ζcntD(ζ1, ζc1, 2, 1, 3);
            ζasyncD(ζ1, 2, 2, 1, function () {
                ζ2 = ζviewD(ζ1, 2, 2, 2, ++ζi2);
                ζc2 = ζ2.cm;
                ζeltD(ζ2, ζc2, 0, 0, "div", 1);
                ζtxtD(ζ2, ζc2, 2, 1, 1, " other text ", 0);
                ζendD(ζ2, ζc2);
            });
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '1');

        // cpt in cpt
        assert.equal(await body.template(`(msg) => {
            <*cpt>
                # {msg} #
                <div @async>
                    # other text #
                    <*cpt>
                        # M2: {msg} #
                        <div @async>
                            # M3: {msg} #
                        </div>
                    </>
                </div>
            </>
        }`), `
            let ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζ3, ζc3, ζi4 = 0, ζ4, ζc4, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζi2 = 0;
            ζ1 = ζviewD(ζ, 1, 0, 3, 0, 1);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, ζs1, 1, [0, msg]);
            ζcntD(ζ1, ζc1, 2, 1, 3);
            ζasyncD(ζ1, 2, 2, 1, function () {
                ζ2 = ζviewD(ζ1, 2, 2, 3, ++ζi2);
                ζc2 = ζ2.cm;
                ζeltD(ζ2, ζc2, 0, 0, "div", 1);
                ζtxtD(ζ2, ζc2, 2, 1, 1, " other text ", 0);
                ζcptD(ζ2, ζc2, 2, 2, 1, [0, cpt], 0);
                ζi4 = 0;
                ζ3 = ζviewD(ζ2, 1, 2, 3, 0, 1);
                ζc3 = ζ3.cm;
                ζfraD(ζ3, ζc3, 0, 0);
                ζtxtD(ζ3, ζc3, 1, 1, 1, ζs2, 1, [0, msg]);
                ζcntD(ζ3, ζc3, 2, 1, 3);
                ζasyncD(ζ3, 2, 2, 1, function () {
                    ζ4 = ζviewD(ζ3, 2, 2, 2, ++ζi4);
                    ζc4 = ζ4.cm;
                    ζeltD(ζ4, ζc4, 0, 0, "div", 1);
                    ζtxtD(ζ4, ζc4, 2, 1, 1, ζs3, 1, [0, msg]);
                    ζendD(ζ4, ζc4);
                });
                ζendD(ζ3, ζc3);
                ζcallD(ζ2, 2);
                ζendD(ζ2, ζc2);
            });
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '2');
    });

    // todo param nodes as root nodes + ζt flag indicating that function generates root param nodes
});

