// iv:ignore
import { body, statics, test } from './utils';
import * as assert from 'assert';

describe('Code generator', () => {

    it("should support static text nodes", async function () {
        assert.equal(await body.template(`() => {
            # Hello World #
        }`), `
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, " Hello World ", 0);
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`() => {
            # Hello #
            # World #
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, 0, " Hello ", 0);
            ζtxt(ζ, ζc, 0, 2, 1, 0, " World ", 0);
            ζend(ζ, ζc);
        `, '2');
    });

    it("should support dynamic text nodes and expressions", async function () {
        assert.equal(await body.template(`(name) => {
            # Hello {name} #
        }`), `
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 1, ζe(ζ, 0, name));
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
            ζtxt(ζ, ζc, 0, 1, 1, 0, ζs1, 1, ζe(ζ, 0, name));
            ζtxt(ζ, ζc, 0, 2, 1, 0, ζs2, 2, ζe(ζ, 1, name+1), ζo(ζ, 0, ζc? name+2 : ζu));
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
            ζtxt(ζ, ζc, 0, 2, 2, 0, ζs1, 1, ζe(ζ, 0, name));
            ζelt(ζ, ζc, 3, 2, "span", 1);
            ζtxt(ζ, ζc, 0, 4, 3, 0, ζs2, 1, ζe(ζ, 1, name));
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
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζelt(ζ, ζc, 1, 1, "span", 1, 0, ζs2);
            ζtxt(ζ, ζc, 0, 2, 2, 0, " Hello ", 0);
            ζelt(ζ, ζc, 3, 1, "span", 1);
            ζtxt(ζ, ζc, 0, 4, 2, 0, " World ", 0);
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
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, 0, ζs1);
            ζelt(ζ, ζc, 1, 1, "span", 1, 0, ζs2, ζs3);
            ζtxt(ζ, ζc, 0, 2, 2, 0, " Hello ", 0);
            ζelt(ζ, ζc, 3, 1, "section", 1);
            ζtxt(ζ, ζc, 0, 4, 2, 0, " World ", 0);
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
            ζelt(ζ, ζc, 0, 0, "div", 0, 0, ζs1);
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
            ζtxt(ζ, ζc, 0, 1, 1, 0, " fragment 1 ", 0);
            ζfra(ζ, ζc, 2, 1);
            ζelt(ζ, ζc, 3, 2, "div", 1);
            ζtxt(ζ, ζc, 0, 4, 3, 0, " fragment 2 ", 0);
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
            ζtxt(ζ, ζc, 0, 1, 1, 0, " Something ", 0);
            x++;
            let bar = { a:"xyz"};
            ζtxt(ζ, ζc, 0, 2, 1, 0, " Something else ", 0);
            ζend(ζ, ζc);
        `, 'statements first and embedded');

        assert.equal(await body.template(`() => {
            # Something #
            do {
                callSomething();
            } while (test);
        }`), `
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, " Something ", 0);
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
                ζtxt(ζ1, ζc1, 0, 0, 0, 0, ζs1, 1, ζe(ζ1, 0, name));
                ζend(ζ1, ζc1);
            }
            ζtxt(ζ, ζc, 0, 2, 1, 0, " \\(end) ", 0);
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
                ζtxt(ζ1, ζc1, 0, 0, 0, 0, ζs1, 1, ζe(ζ1, 0, name));
                ζend(ζ1, ζc1);
            } else {
                ζ2 = ζview(ζ, 0, 2, 1, ++ζi2);
                ζc2 = ζ2.cm;
                ζtxt(ζ2, ζc2, 0, 0, 0, 0, ζs2, 1, ζe(ζ2, 0, name));
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
            ζtxt(ζ, ζc, 0, 1, 1, 0, " hello ", 0);
            ζcnt(ζ, ζc, 2, 1, 1);
            do {
                ζ1 = ζview(ζ, 0, 2, 1, ++ζi1);
                ζc1 = ζ1.cm;
                let x=123;
                ζtxt(ζ1, ζc1, 0, 0, 0, 0, ζs1, 1, ζe(ζ1, 0, name));
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
                ζtxt(ζ1, ζc1, 0, 0, 0, 0, ζs1, 1, ζe(ζ1, 0, name));
                ζend(ζ1, ζc1);
            } let x=1;
            if (b) {
                ζ2 = ζview(ζ, 0, 2, 1, ++ζi2);
                ζc2 = ζ2.cm;
                ζtxt(ζ2, ζc2, 0, 0, 0, 0, ζs2, 1, ζe(ζ2, 0, name));
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
                ζtxt(ζ1, ζc1, 0, 1, 1, 0, ζs1, 1, ζe(ζ1, 0, name));
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
            ζtxt(ζ, ζc, 0, 1, 1, 0, " first ", 0);
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
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, alert), 1, 0, ζs1);
            ζend(ζ, ζc);
        `, '1a');

        assert.deepEqual(t1.statics, [
            'ζs0 = {}',
            'ζs1 = ["class", "important", "position", "bottom"]'
        ], '1b');

        // with dynamic api
        let t2 = await test.template(`() => {
            <*b.section position={getPosition()} msg={myMessage} type="big" important/>
        }`);
        assert.equal(t2.body, `
            let ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, b.section), 0, 0, ζs1);
            ζpar(ζ, ζc, 0, 0, "position", ζe(ζ, 1, getPosition()));
            ζpar(ζ, ζc, 0, 0, "msg", ζe(ζ, 2, myMessage));
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
            <div @onclick={e=>doSomething(e)} @onmousemove={(x,y)=>doSomethingElse(y,x)}>
                # Click {name} #
            </div>
            }`), `
            let ζc = ζinit(ζ, ζs0, 4);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζevt(ζ, ζc, 1, 0, "click", e=>doSomething(e));
            ζevt(ζ, ζc, 2, 0, "mousemove", (x,y)=>doSomethingElse(y,x));
            ζtxt(ζ, ζc, 0, 3, 1, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`(name) => {
            <div @onclick={=>doSomething()} @onmousemove={(x,y)=>doSomethingElse(y,x)}>
                # Click {name} #
            </div>
            }`), `
            let ζc = ζinit(ζ, ζs0, 4);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζevt(ζ, ζc, 1, 0, "click", ()=>doSomething(), 1);
            ζevt(ζ, ζc, 2, 0, "mousemove", (x,y)=>doSomethingElse(y,x));
            ζtxt(ζ, ζc, 0, 3, 1, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        `, '2');

        assert.equal(await body.template(`(name) => {
            <div @onclick(listener={e=>doSomething(e)} options={{capture:true}})>
                # Click {name} #
            </div>
            }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζevt(ζ, ζc, 1, 0, "click", e=>doSomething(e), 0, {capture:true});
            ζtxt(ζ, ζc, 0, 2, 1, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        `, '3');

        assert.equal(await body.template(`(name) => {
            <div @onclick(listener={=>doSomething()} options={{capture:true}})>
                # Click {name} #
            </div>
            }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζevt(ζ, ζc, 1, 0, "click", ()=>doSomething(), 1, {capture:true});
            ζtxt(ζ, ζc, 0, 2, 1, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        `, '4');
    });

    it("should support components with content & no param nodes", async function () {
        assert.equal(await body.template(`() => {
            <*myComponent>
                <span title={getTitle()}/>
            </>
            }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, myComponent), 0);
            ζ1 = ζviewD(ζ, 1, 0, 1, 0);
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
            ζ1 = ζviewD(ζ, 1, 0, 3, 0);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, 0, ζs1, 1, [0, name1]);
            ζcptD(ζ1, ζc1, 1, 2, 1, [1, otherComponent], 0);
            ζparD(ζ1, ζc1, 1, 2, "p1", [2, expr()]);
            ζ2 = ζviewD(ζ1, 1, 2, 1, 0);
            ζc2 = ζ2.cm;
            ζtxtD(ζ2, ζc2, 1, 0, 0, 0, ζs2, 1, [0, name2]);
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
            ζ1 = ζviewD(ζ, 1, 0, 3, 0);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, 0, " first ", 0);
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

    it("should support api argument", async function () {
        let t = await test.template(`($, a, b) => {
            <div class="main">
                # text {$.a} #
            </>
        }`);

        assert.equal(t.function, `(function () {
        const ζs0 = {}, ζs1 = ["class", "main"], ζs2 = [" text ", "", " "];
        @ζΔD class ζParams {
            a: any;
            b: any;
        }
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let a = $api["a"], b = $api["b"];
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζtxt(ζ, ζc, 0, 1, 1, 0, ζs2, 1, ζe(ζ, 0, $.a));
            ζend(ζ, ζc);
        }, ζParams);
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
            "ζelt": 1, "ζtxt": 1, "ζinit": 1, "ζe": 1, "ζend": 1, "ζt": 1, "ζcpt": 1, "ζΔD": 1
        }, "t2 imports");
    });

    it("should support external API class definition", async function () {
        let t1 = await test.template(`($:MyParamClass) => {
            # Hello {$.name} #
        }`);
        assert.equal(t1.function, `(function () {
        const ζs0 = {}, ζs1 = [" Hello ", "", " "];
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 1, ζe(ζ, 0, $.name));
            ζend(ζ, ζc);
        }, MyParamClass);
        })()`, 'simple param class');

        let t2 = await test.template(`($:MyParamClass, name) => {
            # Hello {name} #
        }`);
        assert.equal(t2.function, `(function () {
        const ζs0 = {}, ζs1 = [" Hello ", "", " "];
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let name = $api["name"];
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        }, MyParamClass);
        })()`, 'param class + local variables initialization');
    });

    it("should support external Controller class definition", async function () {
        let t1 = await test.template(`($:MyCtlClass) => {
            # Hello {$.name} #
        }`);
        assert.equal(t1.function, `(function () {
        const ζs0 = {}, ζs1 = [" Hello ", "", " "];
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 1, ζe(ζ, 0, $.name));
            ζend(ζ, ζc);
        }, MyCtlClass);
        })()`, 'simple param class');
    });

    it("should support $template injection", async function () {
        let t1 = await test.template(`(name, $template:IvTemplate) => {
            # Hello {name} #
        }`);
        assert.equal(t1.function, `(function () {
        const ζs0 = {}, ζs1 = [" Hello ", "", " "];
        @ζΔD class ζParams {
            name: any;
        }
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api, $template) {
            let name = $api["name"];
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 1, ζe(ζ, 0, name));
            ζend(ζ, ζc);
        }, ζParams);
        })()`, 'simple param class');
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
            ζelt(ζ, ζc, 0, 0, "div", 0, 0, ζs1);
            ζins(ζ, 0, 0, ζe(ζ, 0, $content));
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support components with content & param nodes", async function () {
        assert.equal(await body.template(`() => {
            # first #
            <*myComponent>
                <.header position="top" foo={bar()}/>
                # some content {baz()} #
                <.footer type="small"/>
            </>
            # last #
            }`), `
            let ζ1, ζc1, ζp0, ζp1, ζc = ζinit(ζ, ζs0, 6);
            ζp0 = ζp1 = 0;
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, 0, " first ", 0);
            ζcpt(ζ, ζc, 0, 2, 1, ζe(ζ, 0, myComponent), 0);
            ζ1 = ζviewD(ζ, 1, 2, 1, 0);
            ζc1 = ζ1.cm;
            ζpnode(ζ, ζc, 0, 3, 2, "header", ζp0++, 0, ζs1);
            ζpar(ζ, ζc, 0, 3, "foo", bar());
            ζtxtD(ζ1, ζc1, 1, 0, 0, 0, ζs2, 1, [0, baz()]);
            ζpnode(ζ, ζc, 0, 4, 2, "footer", ζp1++, 0, ζs3);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 2);
            ζtxt(ζ, ζc, 0, 5, 1, 0, " last ", 0);
            ζend(ζ, ζc);
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
            let ζ1, ζc1, ζp0, ζ2, ζc2, ζp1, ζ3, ζc3, ζc = ζinit(ζ, ζs0, 5);
            ζp0 = ζp1 = 0;
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, 0, " first ", 0);
            ζcpt(ζ, ζc, 0, 2, 1, ζe(ζ, 0, myComponent), 0);
            ζ1 = ζviewD(ζ, 1, 2, 1, 0);
            ζc1 = ζ1.cm;
            ζpnode(ζ, ζc, 0, 3, 2, "header", ζp0++, 0, ζs1);
            ζpar(ζ, ζc, 0, 3, "foo", bar());
            ζ2 = ζviewD(ζ, 1, 3, 1, 0);
            ζc2 = ζ2.cm;
            ζpnode(ζ, ζc, 0, 4, 3, "title", ζp1++);
            ζ3 = ζviewD(ζ, 1, 4, 2, 0);
            ζc3 = ζ3.cm;
            ζeltD(ζ3, ζc3, 0, 0, "b", 1);
            ζtxtD(ζ3, ζc3, 1, 1, 1, 0, ζs2, 1, [0, exp()]);
            ζendD(ζ3, ζc3);
            ζpnEnd(ζ, ζc, 0, 4);
            ζtxtD(ζ2, ζc2, 1, 0, 0, 0, " header content ", 0);
            ζendD(ζ2, ζc2);
            ζpnEnd(ζ, ζc, 0, 3);
            ζtxtD(ζ1, ζc1, 1, 0, 0, 0, ζs3, 1, [0, foo()]);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 2);
            ζend(ζ, ζc);
        `, '2');

        assert.equal(await body.template(`() => {
            <*myComponent>
                <.header foo={bar()}>
                    <.foo position="top">
                        <.bar @paramValue={exp()}/>
                        <.bar @paramValue={exp2()}/>
                    </>
                </>
            </>
            }`), `
            let ζ1, ζc1, ζp0, ζ2, ζc2, ζp1, ζ3, ζc3, ζp2, ζc = ζinit(ζ, ζs0, 5);
            ζp0 = ζp1 = ζp2 = 0;
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, myComponent), 0);
            ζpnode(ζ, ζc, 0, 1, 0, "header", ζp0++);
            ζpar(ζ, ζc, 0, 1, "foo", bar());
            ζpnode(ζ, ζc, 0, 2, 1, "foo", ζp1++, 0, ζs1);
            ζpnode(ζ, ζc, 0, 3, 2, "bar", ζp2++);
            ζpar(ζ, ζc, 0, 3, 0, exp());
            ζpnode(ζ, ζc, 0, 4, 2, "bar", ζp2++);
            ζpar(ζ, ζc, 0, 4, 0, exp2());
            ζpnEnd(ζ, ζc, 0, 2);
            ζpnEnd(ζ, ζc, 0, 1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '3');
    });

    it("should support param nodes with event listeners", async function () {
        assert.equal(await body.template(`() => {
            # first #
             <*hello #hello name="World">
                <.header title={"Header"} @onclick={e=>trackEvent(e, true)}/>
            </*hello>
            # last #
            }`), `
            let ζ1, ζc1, ζp0, ζc = ζinit(ζ, ζs0, 6);
            ζp0 = 0;
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, 0, " first ", 0);
            ζcpt(ζ, ζc, 0, 2, 1, ζe(ζ, 0, hello), 0, 0, ζs1);
            ζpnode(ζ, ζc, 0, 3, 2, "header", ζp0++);
            ζpar(ζ, ζc, 0, 3, "title", "Header");
            ζevt(ζ, ζc, 4, 3, "click", e=>trackEvent(e, true));
            ζcall(ζ, 2, 0, ζs2);
            ζtxt(ζ, ζc, 0, 5, 1, 0, " last ", 0);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support components with param nodes and control statements", async function () {
        let t1 = await test.template(`(x, y) => {
            # first #
            <*myComponent>
                if (x) {
                    # foo #
                    <.header position="top" foo={bar()}/>
                }
                # abc #
                if (y) {
                    # some content {baz()} #
                }
                <.footer type="small"/>
            </>
            # last #
            }`);

        assert.equal(t1.body, `
            let ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζp0, ζi3 = 0, ζ3, ζc3, ζp1, ζc = ζinit(ζ, ζs0, 6);
            ζp0 = ζp1 = 0;
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, 0, " first ", 0);
            ζcpt(ζ, ζc, 0, 2, 1, ζe(ζ, 0, myComponent), 0, 0, 0, ζs4);
            ζi2 = ζi3 = 0;
            ζ1 = ζviewD(ζ, 1, 2, 4, 0);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζcntD(ζ1, ζc1, 1, 1, 1);
            if (x) {
                ζ2 = ζviewD(ζ1, 2, 1, 1, ++ζi2);
                ζc2 = ζ2.cm;
                ζtxtD(ζ2, ζc2, 2, 0, 0, 0, " foo ", 0);
                ζpnode(ζ, ζc, 0, 3, 2, "header", ζp0++, 0, ζs1);
                ζpar(ζ, ζc, 0, 3, "foo", bar());
                ζendD(ζ2, ζc2);
            }
            ζtxtD(ζ1, ζc1, 1, 2, 1, 0, " abc ", 0);
            ζcntD(ζ1, ζc1, 3, 1, 1);
            if (y) {
                ζ3 = ζviewD(ζ1, 2, 3, 1, ++ζi3);
                ζc3 = ζ3.cm;
                ζtxtD(ζ3, ζc3, 2, 0, 0, 0, ζs2, 1, [0, baz()]);
                ζendD(ζ3, ζc3);
            }
            ζpnode(ζ, ζc, 0, 4, 2, "footer", ζp1++, 0, ζs3);
            ζendD(ζ1, ζc1, ζs5);
            ζcall(ζ, 2, 0, 0, ζs4);
            ζtxt(ζ, ζc, 0, 5, 1, 0, " last ", 0);
            ζend(ζ, ζc);
        `, '1');

        assert.deepEqual(t1.statics, [
            "ζs0 = {}",
            "ζs1 = [\"position\", \"top\"]",
            "ζs2 = [\" some content \", \"\", \" \"]",
            "ζs3 = [\"type\", \"small\"]",
            "ζs4 = [\"header\"]",
            "ζs5 = [1, 3]"
        ], "1s");

        let t2 = await test.template(`(x, y, z) => {
            <*myComponent>
                if (x) {
                    <.header position="top" foo={bar()}>
                    if (y) {
                        <.title type="small"/>
                    }
                    </.header>
                }
                # abc #
                if (z) {
                    <.footer foo="bar"/>
                }
            </>
            }`);

        assert.equal(t2.body, `
            let ζ1, ζc1, ζi2 = 0, ζ2, ζc2, ζp0, ζ3, ζc3, ζi4 = 0, ζ4, ζc4, ζp1, ζi5 = 0, ζ5, ζc5, ζp2, ζc = ζinit(ζ, ζs0, 4);
            ζp0 = ζp1 = ζp2 = 0;
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, myComponent), 0, 0, 0, ζs4);
            ζi2 = ζi5 = 0;
            ζ1 = ζviewD(ζ, 1, 0, 4, 0);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζcntD(ζ1, ζc1, 1, 1, 1);
            if (x) {
                ζpnode(ζ, ζc, 0, 1, 0, "header", ζp0++, 0, ζs1, ζs6);
                ζpar(ζ, ζc, 0, 1, "foo", bar());
                ζi4 = 0;
                ζ3 = ζviewD(ζ, 1, 1, 1, 0);
                ζc3 = ζ3.cm;
                ζcntD(ζ3, ζc3, 0, 0, 1);
                if (y) {
                    ζpnode(ζ, ζc, 0, 2, 1, "title", ζp1++, 0, ζs2);
                }
                ζendD(ζ3, ζc3, ζs7);
                ζpnEnd(ζ, ζc, 0, 1, 0, ζs6);
            }
            ζtxtD(ζ1, ζc1, 1, 2, 1, 0, " abc ", 0);
            ζcntD(ζ1, ζc1, 3, 1, 1);
            if (z) {
                ζpnode(ζ, ζc, 0, 3, 0, "footer", ζp2++, 0, ζs3);
            }
            ζendD(ζ1, ζc1, ζs5);
            ζcall(ζ, 0, 0, 0, ζs4);
            ζend(ζ, ζc);
        `, '2');

        assert.deepEqual(t2.statics, [
            "ζs0 = {}",
            "ζs1 = [\"position\", \"top\"]",
            "ζs2 = [\"type\", \"small\"]",
            "ζs3 = [\"foo\", \"bar\"]",
            "ζs4 = [\"header\", \"footer\"]",
            "ζs5 = [1, 3]",
            "ζs6 = [\"title\"]",
            "ζs7 = [0]"
        ], "2s");
    });

    it("should support components with param nodes within control statements", async function () {
        let t1 = await test.template(`(nbrOfRows=0) => {
            if (nbrOfRows>0) {
                <*grid>
                    for (let i=0;nbrOfRows>i;i++) {
                        <.row>
                            <.summary id={i}> # Summary {i} # </>
                        </>
                    }
                </>
            }
        }`);

        assert.equal(t1.body, `
            let ζi1 = 0, ζ1, ζc1, ζ2, ζc2, ζi3 = 0, ζ3, ζc3, ζp0, ζ4, ζc4, ζp1, ζ5, ζc5, ζc = ζinit(ζ, ζs0, 1);
            ζcnt(ζ, ζc, 0, 0, 1);
            if (nbrOfRows>0) {
                ζ1 = ζview(ζ, 0, 0, 3, ++ζi1);
                ζc1 = ζ1.cm;
                ζp0 = ζp1 = 0;
                ζcpt(ζ1, ζc1, 0, 0, 0, ζe(ζ1, 0, grid), 0, 0, 0, ζs3);
                ζi3 = 0;
                ζ2 = ζviewD(ζ1, 1, 0, 1, 0);
                ζc2 = ζ2.cm;
                ζcntD(ζ2, ζc2, 0, 0, 1);
                for (let i=0;nbrOfRows>i;i++) {
                    ζpnode(ζ1, ζc1, 0, 1, 0, "row", ζp0++);
                    ζpnode(ζ1, ζc1, 0, 2, 1, "summary", ζp1++);
                    ζpar(ζ1, ζc1, 0, 2, "id", i);
                    ζ5 = ζviewD(ζ1, 1, 2, 1, 0);
                    ζc5 = ζ5.cm;
                    ζtxtD(ζ5, ζc5, 1, 0, 0, 0, ζs1, 1, [0, i]);
                    ζendD(ζ5, ζc5);
                    ζpnEnd(ζ1, ζc1, 0, 2);
                    ζpnEnd(ζ1, ζc1, 0, 1);
                }
                ζendD(ζ2, ζc2, ζs4);
                ζcall(ζ1, 0, 0, 0, ζs3);
                ζend(ζ1, ζc1);
            }
            ζend(ζ, ζc, ζs2);
        `, '1');
    });

    it("should not create content fragments components with only param nodes and js statements", async function () {
        assert.equal(await body.template(`() => {
            <*foo>
                <.paramA value="a"/>
                let bar=foo;
                <.paramB value={exp(bar)}/>
            </>
        }`), `
            let ζ1, ζc1, ζp0, ζp1, ζc = ζinit(ζ, ζs0, 3);
            ζp0 = ζp1 = 0;
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, foo), 0);
            ζpnode(ζ, ζc, 0, 1, 0, "paramA", ζp0++, 0, ζs1);
            let bar=foo;
            ζpnode(ζ, ζc, 0, 2, 0, "paramB", ζp1++);
            ζpar(ζ, ζc, 0, 2, "value", exp(bar));
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should properly generate 2 components with or without param nodes", async function () {
        assert.equal(await body.template(`() => {
            <*foo>
                <.paramA value="a"/>
            </>
            <*bar>
                let x = 123;
            </>
        }`), `
            let ζ1, ζc1, ζp0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 4);
            ζp0 = 0;
            ζfra(ζ, ζc, 0, 0);
            ζcpt(ζ, ζc, 0, 1, 1, ζe(ζ, 0, foo), 0);
            ζpnode(ζ, ζc, 0, 2, 1, "paramA", ζp0++, 0, ζs1);
            ζcall(ζ, 1);
            ζcpt(ζ, ζc, 0, 3, 1, ζe(ζ, 1, bar), 1);
            let x = 123;
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support deferred param nodes", async function () {
        assert.equal(await body.template(`() => {
            <*foo>
                <.paramA value="a"/>
                <*bar>
                    <.paramB value="b"/>
                </>
            </>
        }`), `
            let ζ1, ζc1, ζp0, ζ2, ζc2, ζp1, ζc = ζinit(ζ, ζs0, 2);
            ζp0 = 0;
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, foo), 0);
            ζ1 = ζviewD(ζ, 1, 0, 2, 0);
            ζc1 = ζ1.cm;
            ζp1 = 0;
            ζpnode(ζ, ζc, 0, 1, 0, "paramA", ζp0++, 0, ζs1);
            ζcptD(ζ1, ζc1, 1, 0, 0, [0, bar], 0);
            ζpnode(ζ1, ζc1, 1, 1, 0, "paramB", ζp1++, 0, ζs2);
            ζcallD(ζ1, 0);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
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
        const ζs0 = {}, ζs1 = ["class", "main"], ζs2 = ["type", "important"], ζs3 = ["class", "content"];
        return ζt("testTpl", "test.ts", ζs0, function (ζ) {
            let ζ1, ζc1, ζp0, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 3);
            ζp0 = 0;
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζcpt(ζ, ζc, 0, 1, 1, ζe(ζ, 0, b.section), 0, 0, ζs2);
            ζ1 = ζviewD(ζ, 1, 1, 2, 0);
            ζc1 = ζ1.cm;
            ζpnode(ζ, ζc, 0, 2, 1, "header", ζp0++);
            ζ2 = ζviewD(ζ, 1, 2, 1, 0);
            ζc2 = ζ2.cm;
            ζtxtD(ζ2, ζc2, 1, 0, 0, 0, " The big title ", 0);
            ζendD(ζ2, ζc2);
            ζpnEnd(ζ, ζc, 0, 2);
            ζeltD(ζ1, ζc1, 0, 0, "span", 1, 0, ζs3);
            ζtxtD(ζ1, ζc1, 1, 1, 1, 0, " Section content ", 0);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 1);
            ζend(ζ, ζc);
        });
        })()` , 'f1');
        assert.deepEqual(t1.importMap, {
            "ζinit": 1, "ζelt": 1, "ζeltD": 1, "ζpnode": 1, "ζtxtD": 1, "ζcpt": 1, "ζe": 1, "ζcall": 1, "ζend": 1, "ζendD": 1, "ζviewD": 1, "ζpnEnd": 1, "ζt": 1
        }, 'imports 1');

        let t2 = await test.template(`(name) => {
            <div class="msg" [title]={"Message for " + name}>
                # Hello {name} #
            </>
        }`);
        assert.equal(t2.function, `(function () {
        const ζs0 = {}, ζs1 = ["class", "msg"], ζs2 = [" Hello ", "", " "];
        @ζΔD class ζParams {
            name: any;
        }
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let name = $api["name"];
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζpro(ζ, 0, 0, "title", ζe(ζ, 0, "Message for " + name));
            ζtxt(ζ, ζc, 0, 1, 1, 0, ζs2, 1, ζe(ζ, 1, name));
            ζend(ζ, ζc);
        }, ζParams);
        })()` , 'f2');
        assert.deepEqual(t2.importMap, {
            "ζinit": 1, "ζelt": 1, "ζtxt": 1, "ζe": 1, "ζend": 1, "ζpro": 1, "ζΔD": 1, "ζt": 1
        }, 'imports 2');

        let t3 = await test.template(`(firstName, lastName) => {
            # Hello {firstName} {::lastName} #
        }`);
        assert.equal(t3.function, `(function () {
        const ζs0 = {}, ζs1 = [" Hello ", "", " ", "", " "];
        @ζΔD class ζParams {
            firstName: any;
            lastName: any;
        }
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let firstName = $api["firstName"], lastName = $api["lastName"];
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 2, ζe(ζ, 0, firstName), ζo(ζ, 0, ζc? lastName : ζu));
            ζend(ζ, ζc);
        }, ζParams);
        })()` , 'f3');
        assert.deepEqual(t3.importMap, {
            "ζtxt": 1, "ζinit": 1, "ζe": 1, "ζu": 1, "ζend": 1, "ζo": 1, "ζΔD": 1, "ζt": 1
        }, 'imports 3');
    });

    it("should support optional params", async function () {
        let t1 = await test.template(`(header?: MyHeader) => {
            <div class="main">
                if (header) {
                    <div class="header" @content={header}/>
                }
            </>
        }`);

        assert.equal(t1.function, `(function () {
        const ζs0 = {}, ζs1 = ["class", "main"], ζs2 = ["class", "header"], ζs3 = [1];
        @ζΔD class ζParams {
            header?: MyHeader;
        }
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let header = $api["header"];
            let ζi1 = 0, ζ1, ζc1, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζcnt(ζ, ζc, 1, 1, 1);
            if (header) {
                ζ1 = ζview(ζ, 0, 1, 1, ++ζi1);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "div", 0, 0, ζs2);
                ζins(ζ1, 0, 0, ζe(ζ1, 0, header));
                ζend(ζ1, ζc1);
            }
            ζend(ζ, ζc, ζs3);
        }, ζParams);
        })()` , 'f1');
    });

    it("should support async elements", async function () {
        assert.equal(await body.template(`(msg) => {
            <div>
                <div @async class="foo">
                    # Message: {msg} #
                </div>
            </div>
        }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcnt(ζ, ζc, 1, 1, 3);
            ζasync(ζ, 0, 1, 1, function () {
                ζ1 = ζview(ζ, 0, 1, 2, 0);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "div", 1, 0, ζs2);
                ζtxt(ζ1, ζc1, 0, 1, 1, 0, ζs3, 1, ζe(ζ1, 0, msg));
                ζend(ζ1, ζc1);
            });
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`(msg) => {
            <div @async=3>
                # Message: {msg} #
            </div>
        }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 1);
            ζcnt(ζ, ζc, 0, 0, 3);
            ζasync(ζ, 0, 0, 3, function () {
                ζ1 = ζview(ζ, 0, 0, 2, 0);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "div", 1);
                ζtxt(ζ1, ζc1, 0, 1, 1, 0, ζs1, 1, ζe(ζ1, 0, msg));
                ζend(ζ1, ζc1);
            });
            ζend(ζ, ζc);
        `, '2');

        assert.equal(await body.template(`(msg) => {
            <div @async={expr()} @onclick={e=>doSomething(e)}>
                # Message1: {msg} #
            </div>
            # Message2: {msg} #
        }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζcnt(ζ, ζc, 1, 1, 3);
            ζasync(ζ, 0, 1, ζe(ζ, 0, expr()), function () {
                ζ1 = ζview(ζ, 0, 1, 3, 0);
                ζc1 = ζ1.cm;
                ζelt(ζ1, ζc1, 0, 0, "div", 1);
                ζevt(ζ1, ζc1, 1, 0, "click", e=>doSomething(e));
                ζtxt(ζ1, ζc1, 0, 2, 1, 0, ζs1, 1, ζe(ζ1, 0, msg));
                ζend(ζ1, ζc1);
            });
            ζtxt(ζ, ζc, 0, 2, 1, 0, ζs2, 1, ζe(ζ, 1, msg));
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
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcnt(ζ, ζc, 1, 1, 3);
            ζasync(ζ, 0, 1, ζe(ζ, 0, expr()), function () {
                ζ1 = ζview(ζ, 0, 1, 2, 0);
                ζc1 = ζ1.cm;
                ζfra(ζ1, ζc1, 0, 0);
                ζtxt(ζ1, ζc1, 0, 1, 1, 0, ζs1, 1, ζe(ζ1, 0, msg));
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
                ζ1 = ζview(ζ, 0, 1, 1, 0);
                ζc1 = ζ1.cm;
                ζcpt(ζ1, ζc1, 0, 0, 0, ζe(ζ1, 0, section), 0);
                ζpar(ζ1, ζc1, 0, 0, "title", ζe(ζ1, 1, msg));
                ζ2 = ζviewD(ζ1, 1, 0, 1, 0);
                ζc2 = ζ2.cm;
                ζtxtD(ζ2, ζc2, 1, 0, 0, 0, ζs1, 1, [0, msg]);
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
            let ζ1, ζc1, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζ1 = ζviewD(ζ, 1, 0, 3, 0);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, 0, ζs1, 1, [0, msg]);
            ζcntD(ζ1, ζc1, 2, 1, 3);
            ζasyncD(ζ1, 2, 2, 1, function () {
                ζ2 = ζviewD(ζ1, 2, 2, 2, 0);
                ζc2 = ζ2.cm;
                ζeltD(ζ2, ζc2, 0, 0, "div", 1);
                ζtxtD(ζ2, ζc2, 2, 1, 1, 0, " other text ", 0);
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
            let ζ1, ζc1, ζ2, ζc2, ζ3, ζc3, ζ4, ζc4, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζ1 = ζviewD(ζ, 1, 0, 3, 0);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, 0, ζs1, 1, [0, msg]);
            ζcntD(ζ1, ζc1, 2, 1, 3);
            ζasyncD(ζ1, 2, 2, 1, function () {
                ζ2 = ζviewD(ζ1, 2, 2, 3, 0);
                ζc2 = ζ2.cm;
                ζeltD(ζ2, ζc2, 0, 0, "div", 1);
                ζtxtD(ζ2, ζc2, 2, 1, 1, 0, " other text ", 0);
                ζcptD(ζ2, ζc2, 2, 2, 1, [0, cpt], 0);
                ζ3 = ζviewD(ζ2, 1, 2, 3, 0);
                ζc3 = ζ3.cm;
                ζfraD(ζ3, ζc3, 0, 0);
                ζtxtD(ζ3, ζc3, 1, 1, 1, 0, ζs2, 1, [0, msg]);
                ζcntD(ζ3, ζc3, 2, 1, 3);
                ζasyncD(ζ3, 2, 2, 1, function () {
                    ζ4 = ζviewD(ζ3, 2, 2, 2, 0);
                    ζc4 = ζ4.cm;
                    ζeltD(ζ4, ζc4, 0, 0, "div", 1);
                    ζtxtD(ζ4, ζc4, 2, 1, 1, 0, ζs3, 1, [0, msg]);
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

    it("should support default values on template api", async function () {
        let t = await test.template(`(a:string="abc", b=false, c=123.45, d=12, e='hello') => {
            # a:{a} b:{b} c:{c} d:{d} e:{e} #
        }`);

        assert.equal(t.function, `(function () {
        const ζs0 = {}, ζs1 = [" a:", "", " b:", "", " c:", "", " d:", "", " e:", "", " "];
        @ζΔD class ζParams {
            a: string = "abc";
            b: any = false;
            c: any = 123.45;
            d: any = 12;
            e: any = 'hello';
        }
        return ζt("testTpl", "test.ts", ζs0, function (ζ, $, $api) {
            let a = $api["a"], b = $api["b"], c = $api["c"], d = $api["d"], e = $api["e"];
            let ζc = ζinit(ζ, ζs0, 1);
            ζtxt(ζ, ζc, 0, 0, 0, 0, ζs1, 5, ζe(ζ, 0, a), ζe(ζ, 1, b), ζe(ζ, 2, c), ζe(ζ, 3, d), ζe(ζ, 4, e));
            ζend(ζ, ζc);
        }, ζParams);
        })()` , 'f1');
    });

    it("should support static labels on elements", async function () {
        // support labels on elts, text nodes and components -> error otherwise
        let t1 = await test.template(`() => {
            <div #divA class="main">
                <span #spanB #col> # Hello # </span>
            </>
        }`);
        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 1, ζs2, ζs1);
            ζelt(ζ, ζc, 1, 1, "span", 1, ζs3);
            ζtxt(ζ, ζc, 0, 2, 2, 0, " Hello ", 0);
            ζend(ζ, ζc);
        `, '1a');

        assert.deepEqual(t1.statics, [
            "ζs0 = {}",
            "ζs1 = [\"class\", \"main\"]",
            "ζs2 = [\"#divA\"]",
            "ζs3 = [\"#spanB\", \"#col\"]"
        ], "1s");
    });

    it("should support static labels on text nodes", async function () {
        let t1 = await test.template(`() => {
            # (#txt1 #txt) Hello #
            <div>
                 # (#txt) World #
            </div>
        }`);
        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 4);
            ζfra(ζ, ζc, 0, 0);
            ζtxt(ζ, ζc, 0, 1, 1, ζs1, " Hello ", 0);
            ζelt(ζ, ζc, 2, 1, "div", 1);
            ζtxt(ζ, ζc, 0, 3, 2, ζs2, " World ", 0);
            ζend(ζ, ζc);
        `, '1a');

        assert.deepEqual(t1.statics, [
            "ζs0 = {}",
            "ζs1 = [\"#txt1\", \"#txt\"]",
            "ζs2 = [\"#txt\"]"
        ], "1s");
    });

    it("should support static labels on components", async function () {
        // callImmediately: false
        let t1 = await test.template(`() => {
            <*cpt #label1 arg1=1>
                <*cpt #label2 #label3 arg2=2>
                    # Hello #
                </>
            </>
        }`);
        assert.equal(t1.body, `
            let ζ1, ζc1, ζ2, ζc2, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0, 0, ζs1);
            ζ1 = ζviewD(ζ, 1, 0, 1, 0);
            ζc1 = ζ1.cm;
            ζcptD(ζ1, ζc1, 1, 0, 0, [0, cpt], 0, 0, ζs3);
            ζ2 = ζviewD(ζ1, 1, 0, 1, 0);
            ζc2 = ζ2.cm;
            ζtxtD(ζ2, ζc2, 1, 0, 0, 0, " Hello ", 0);
            ζendD(ζ2, ζc2);
            ζcallD(ζ1, 0, 0, ζs4);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0, 0, ζs2);
            ζend(ζ, ζc);
        `, '1a');

        assert.deepEqual(t1.statics, [
            "ζs0 = {}",
            "ζs1 = [\"arg1\", 1]",
            "ζs2 = [\"#label1\"]",
            "ζs3 = [\"arg2\", 2]",
            "ζs4 = [\"#label2\", \"#label3\"]"
        ], "1s");

        // callImmediately: true
        let t2 = await test.template(`() => {
            <*cpt #label1 arg1=1 />
            <*cpt #label2 #label3 arg2=2/>
        }`);

        assert.equal(t2.body, `
            let ζc = ζinit(ζ, ζs0, 3);
            ζfra(ζ, ζc, 0, 0);
            ζcpt(ζ, ζc, 0, 1, 1, ζe(ζ, 0, cpt), 1, ζs2, ζs1);
            ζcpt(ζ, ζc, 0, 2, 1, ζe(ζ, 1, cpt), 1, ζs4, ζs3);
            ζend(ζ, ζc);
        `, '2a');

        assert.deepEqual(t2.statics, [
            "ζs0 = {}",
            "ζs1 = [\"arg1\", 1]",
            "ζs2 = [\"#label1\"]",
            "ζs3 = [\"arg2\", 2]",
            "ζs4 = [\"#label2\", \"#label3\"]"
        ], "2s");
    });

    it("should support dynamic labels on elements, components and text nodes", async function () {
        // support labels on elts, text nodes and components -> error otherwise
        let t1 = await test.template(`() => {
            <div #divA={expr()} #divB class="main">
                <span #spanB #col> # (#txt={expr2()}) Hello # </span>
                <*cpt #foo={expr3()}> # (#txt={expr3()}) HelloD # </*cpt>
            </>
        }`);
        assert.equal(t1.body, `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 4);
            ζelt(ζ, ζc, 0, 0, "div", 1, ζs2, ζs1);
            ζlbl(ζ, 0, 0, "#divA", expr());
            ζelt(ζ, ζc, 1, 1, "span", 1, ζs3);
            ζtxt(ζ, ζc, 0, 2, 2, 0, " Hello ", 0);
            ζlbl(ζ, 0, 2, "#txt", expr2());
            ζcpt(ζ, ζc, 0, 3, 1, ζe(ζ, 0, cpt), 0);
            ζlbl(ζ, 0, 3, "#foo", expr3());
            ζ1 = ζviewD(ζ, 1, 3, 1, 0);
            ζc1 = ζ1.cm;
            ζtxtD(ζ1, ζc1, 1, 0, 0, 0, " HelloD ", 0);
            ζlblD(ζ1, 1, 0, "#txt", expr3());
            ζendD(ζ1, ζc1);
            ζcall(ζ, 3);
            ζend(ζ, ζc);
        `, '1a');

        assert.deepEqual(t1.statics, [
            "ζs0 = {}",
            "ζs1 = [\"class\", \"main\"]",
            "ζs2 = [\"#divB\"]",
            "ζs3 = [\"#spanB\", \"#col\"]"
        ], "1s");
    });

    it("should support xmlns", async function () {
        assert.equal(await body.template(`(name) => {
            <div class="foo">
                <svg xmlns="http://www.w3.org/2000/svg">
                    <circle class="clock-face" r="48"/>
                </>
            </div>
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζxmlns(ζ, 0, "http://www.w3.org/2000/svg");
            ζelt(ζ, ζc, 1, 1, "svg", 1, 0, ζs2);
            ζelt(ζ, ζc, 2, 2, "circle", 0, 0, ζs3);
            ζxmlns(ζ, 0);
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`(name) => {
            <div class="foo">
                <svg @xmlns="svg">
                    <circle class="clock-face" r="48"/>
                </>
            </div>
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζxmlns(ζ, 0, "http://www.w3.org/2000/svg");
            ζelt(ζ, ζc, 1, 1, "svg", 1);
            ζelt(ζ, ζc, 2, 2, "circle", 0, 0, ζs2);
            ζxmlns(ζ, 0);
            ζend(ζ, ζc);
        `, '2');

        assert.equal(await body.template(`(name) => {
            <div class="foo">
                <! @xmlns="svg">
                    <svg>
                        <circle class="clock-face" r="48"/>
                    </>
                </>
            </div>
        }`), `
            let ζc = ζinit(ζ, ζs0, 4);
            ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
            ζxmlns(ζ, 0, "http://www.w3.org/2000/svg");
            ζfra(ζ, ζc, 1, 1);
            ζelt(ζ, ζc, 2, 2, "svg", 1);
            ζelt(ζ, ζc, 3, 3, "circle", 0, 0, ζs2);
            ζxmlns(ζ, 0);
            ζend(ζ, ζc);
        `, '3');
    });

    it("should support simple decorators - default param with expression", async function () {
        assert.equal(await body.template(`(name) => {
            <div @x.y.foo={exp()}/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "x.y.foo", x.y.foo, 1, exp());
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support simple decorators - no values", async function () {
        assert.equal(await body.template(`(name) => {
            <div @a.something/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "a.something", a.something, 0);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support simple decorators - literal value", async function () {
        assert.equal(await body.template(`(name) => {
            <div @foo = "bar"/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 1, "bar");
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support simple decorators - multiple params", async function () {
        assert.equal(await body.template(`(name) => {
            <div @foo(x="abc" y={exp1()} z={exp2()})/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2, 0, ζs1);
            ζpar(ζ, ζc, 0, 1, "y", ζe(ζ, 0, exp1()));
            ζpar(ζ, ζc, 0, 1, "z", ζe(ζ, 1, exp2()));
            ζdecoEnd(ζ, ζc, 0, 1);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support simple decorators - multiple params w/ listener", async function () {
        let t1 = await test.template(`() => {
            <div @foo(x="abc" @onclick={=>doSomething()})/>
        }`);
        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2, 0, ζs1);
            ζevt(ζ, ζc, 2, 1, "click", ()=>doSomething(), 1);
            ζdecoEnd(ζ, ζc, 0, 1);
            ζend(ζ, ζc);
        `, '1a');
        assert.deepEqual(t1.statics, [
            'ζs0 = {}',
            'ζs1 = ["x", "abc"]'
        ], '1b');
    });

    it("should support simple decorators - multiple params w/ static label", async function () {
        let t1 = await test.template(`() => {
            <div @foo(#theKing)/>
        }`);
        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 0, 0, 0, ζs1);
            ζend(ζ, ζc);
        `, '1a');
        assert.deepEqual(t1.statics, [
            'ζs0 = {}',
            'ζs1 = ["#theKing"]'
        ], '1b');
    });

    it("should support simple decorators - multiple params w/ dynamic label", async function () {
        let t1 = await test.template(`() => {
            <div @foo(#theThing={exp()} baz)/>
        }`);
        assert.equal(t1.body, `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2, 0, ζs1);
            ζlbl(ζ, 0, 1, "#theThing", exp());
            ζdecoEnd(ζ, ζc, 0, 1);
            ζend(ζ, ζc);
        `, '1a');
        assert.deepEqual(t1.statics, [
            'ζs0 = {}',
            'ζs1 = ["baz", true]'
        ], '1b');
    });

    it("should support decorators on components - no content", async function () {
        assert.equal(await body.template(`(name) => {
            <*cpt @foo(x="abc" y={exp1()} z={exp2()})/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζcall(ζ, 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2, 0, ζs1);
            ζpar(ζ, ζc, 0, 1, "y", ζe(ζ, 1, exp1()));
            ζpar(ζ, ζc, 0, 1, "z", ζe(ζ, 2, exp2()));
            ζdecoEnd(ζ, ζc, 0, 1);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support decorators on components - with content", async function () {
        assert.equal(await body.template(`(name) => {
            <*cpt @foo(x={exp1()} y={exp2()})>
                <div>
                    # Hello {exp3()} #
                </>
            </>
        }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 2);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζ1 = ζviewD(ζ, 1, 0, 2, 0);
            ζc1 = ζ1.cm;
            ζeltD(ζ1, ζc1, 0, 0, "div", 1);
            ζtxtD(ζ1, ζc1, 1, 1, 1, 0, ζs1, 1, [0, exp3()]);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2);
            ζpar(ζ, ζc, 0, 1, "x", ζe(ζ, 1, exp1()));
            ζpar(ζ, ζc, 0, 1, "y", ζe(ζ, 2, exp2()));
            ζdecoEnd(ζ, ζc, 0, 1);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support decorators inside component content", async function () {
        assert.equal(await body.template(`(name) => {
            <*cpt>
                <div @foo(x={exp1()} y={exp2()})>
                    # Hello {exp3()} #
                </>
            </>
        }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζ1 = ζviewD(ζ, 1, 0, 3, 0);
            ζc1 = ζ1.cm;
            ζeltD(ζ1, ζc1, 0, 0, "div", 1);
            ζdecoD(ζ1, ζc1, 1, 1, 0, "foo", foo, 2);
            ζparD(ζ1, ζc1, 1, 1, "x", [0, exp1()]);
            ζparD(ζ1, ζc1, 1, 1, "y", [1, exp2()]);
            ζdecoEndD(ζ1, ζc1, 1, 1);
            ζtxtD(ζ1, ζc1, 1, 2, 1, 0, ζs1, 1, [2, exp3()]);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '1');
    });

    it("should support bindings on components", async function () {
        assert.equal(await body.template(`(name) => {
            <div>
                <*cpt prop={=a.b.c}/>
            </>
        }`), `
            let ζc = ζinit(ζ, ζs0, 2);
            ζelt(ζ, ζc, 0, 0, "div", 1);
            ζcpt(ζ, ζc, 0, 1, 1, ζe(ζ, 0, cpt), 0);
            ζbind(ζ, ζc, 0, 1, 0, "prop", a.b, "c");
            ζcall(ζ, 1);
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`(name) => {
            <*section>
                # text {name} #
                <*cpt prop={=a[b()](123).c}/>
            </>
        }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, section), 0);
            ζ1 = ζviewD(ζ, 1, 0, 3, 0);
            ζc1 = ζ1.cm;
            ζfraD(ζ1, ζc1, 0, 0);
            ζtxtD(ζ1, ζc1, 1, 1, 1, 0, ζs1, 1, [0, name]);
            ζcptD(ζ1, ζc1, 1, 2, 1, [1, cpt], 0);
            ζbindD(ζ1, ζc1, 1, 2, 0, "prop", a[b()](123), "c");
            ζcallD(ζ1, 2);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '2');

        assert.equal(await body.template(`(name) => {
            <*cpt prop1={=a.b.c} prop2={exp()} prop3={=d.e}/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζbind(ζ, ζc, 0, 0, 0, "prop1", a.b, "c");
            ζpar(ζ, ζc, 0, 0, "prop2", ζe(ζ, 1, exp()));
            ζbind(ζ, ζc, 0, 0, 1, "prop3", d, "e");
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '3');
    });

    it("should support bindings on decorators", async function () {
        assert.equal(await body.template(`(name) => {
            <div @foo = {=a.b} @bar(prop={=c.d})/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζelt(ζ, ζc, 0, 0, "div", 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2);
            ζbind(ζ, ζc, 0, 1, 0, 0, a, "b");
            ζdecoEnd(ζ, ζc, 0, 1);
            ζdeco(ζ, ζc, 0, 2, 0, "bar", bar, 2);
            ζbind(ζ, ζc, 0, 2, 0, "prop", c, "d");
            ζdecoEnd(ζ, ζc, 0, 2);
            ζend(ζ, ζc);
        `, '1');

        assert.equal(await body.template(`(name) => {
            <*cpt>
                <div @foo = {=a.b} @bar(prop={=c.d})/>
            </>
        }`), `
            let ζ1, ζc1, ζc = ζinit(ζ, ζs0, 1);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζ1 = ζviewD(ζ, 1, 0, 3, 0);
            ζc1 = ζ1.cm;
            ζeltD(ζ1, ζc1, 0, 0, "div", 0);
            ζdecoD(ζ1, ζc1, 1, 1, 0, "foo", foo, 2);
            ζbindD(ζ1, ζc1, 1, 1, 0, 0, a, "b");
            ζdecoEndD(ζ1, ζc1, 1, 1);
            ζdecoD(ζ1, ζc1, 1, 2, 0, "bar", bar, 2);
            ζbindD(ζ1, ζc1, 1, 2, 0, "prop", c, "d");
            ζdecoEndD(ζ1, ζc1, 1, 2);
            ζendD(ζ1, ζc1);
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '2');

        assert.equal(await body.template(`(name) => {
            <*cpt xx={=x.x} @foo(prop1={=c.d} prop2=123 prop3={=e.f}) yy={=y.y} @bar(propA={=a.b} propB={=c.d}) zz={=z.z}/>
        }`), `
            let ζc = ζinit(ζ, ζs0, 3);
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζbind(ζ, ζc, 0, 0, 0, "xx", x, "x");
            ζbind(ζ, ζc, 0, 0, 1, "yy", y, "y");
            ζbind(ζ, ζc, 0, 0, 2, "zz", z, "z");
            ζcall(ζ, 0);
            ζdeco(ζ, ζc, 0, 1, 0, "foo", foo, 2, 0, ζs1);
            ζbind(ζ, ζc, 0, 1, 0, "prop1", c, "d");
            ζbind(ζ, ζc, 0, 1, 1, "prop3", e, "f");
            ζdecoEnd(ζ, ζc, 0, 1);
            ζdeco(ζ, ζc, 0, 2, 0, "bar", bar, 2);
            ζbind(ζ, ζc, 0, 2, 0, "propA", a, "b");
            ζbind(ζ, ζc, 0, 2, 1, "propB", c, "d");
            ζdecoEnd(ζ, ζc, 0, 2);
            ζend(ζ, ζc);
        `, '3');
    });

    it("should support bindings on param nodes", async function () {
        assert.equal(await body.template(`(name) => {
            <*cpt>
                <.foo @paramValue={=a.b}/>
            </>
        }`), `
            let ζ1, ζc1, ζp0, ζc = ζinit(ζ, ζs0, 2);
            ζp0 = 0;
            ζcpt(ζ, ζc, 0, 0, 0, ζe(ζ, 0, cpt), 0);
            ζpnode(ζ, ζc, 0, 1, 0, "foo", ζp0++);
            ζbind(ζ, ζc, 0, 1, 0, 0, a, "b");
            ζcall(ζ, 0);
            ζend(ζ, ζc);
        `, '1');
    });

    // todo param nodes as root nodes + ζt flag indicating that function generates root param nodes
});
