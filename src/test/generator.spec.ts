import { body, statics, test } from './utils';
import * as assert from 'assert';
import { PARAM } from '../xjs/parser/scopes';


describe('Code generator', () => {

    it("should support static text nodes", async function () {
        assert.equal(await body.template(`() => {
            # Hello World #
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζtxt(ζ, 1, 1, 0, " Hello World ");
            }
            ζend(ζ, 1);
        `, '1');

        assert.equal(await body.template(`() => {
            # Hello #
            # World #
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0, " Hello ");
                ζtxt(ζ, 3, 1, 0, " World ");
            }
            ζend(ζ, 1);
        `, '2');
    });

    it("should support dynamic text nodes and expressions", async function () {
        assert.equal(await body.template(`(name) => {
            # Hello {name} #
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζtxt(ζ, 1, 1, 0);
            }
            ζtxtval(ζ, 1, 0, ζs0, 1, ζe(ζ, 0, 1, name));
            ζend(ζ, 1);
        `, '1');

        assert.deepEqual(await statics.template(`(name) => {
            # Hello {name} #
        }` ), [
                'ζs0 = [" Hello ", " "]'
            ], '2');

        assert.equal(await body.template(`(name) => {
            # Hello {name} #
            # {name+1} {::name+2} #
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0);
                ζtxt(ζ, 3, 1, 0);
            }
            ζtxtval(ζ, 2, 0, ζs0, 1, ζe(ζ, 0, 1, name));
            ζtxtval(ζ, 3, 0, ζs1, 2, ζe(ζ, 1, 1, name+1), ζc1 ? name+2 : ζu);
            ζend(ζ, 1);
        `, '3');

        assert.deepEqual(await statics.template(`(name) => {
            # Hello {name} #
            # {name+1} {::name+2} #
        }` ), [
                'ζs0 = [" Hello ", " "]',
                'ζs1 = [" ", " ", " "]'
            ], '4');
    });

    it("should support element nodes", async function () {
        let t1 = await test.template(`() => {
            <div class="main">
                <span class="foo" enabled=true col = 2> # Hello # </span>
                <span> # World # </span>
            </>
        }`);
        assert.equal(t1.body, `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζelt(ζ, 1, 1, 0, "div", ζs0);
                ζelt(ζ, 2, 1, 0, "span", ζs1);
                ζtxt(ζ, 3, 2, 0, " Hello ");
                ζelt(ζ, 4, 1, 0, "span");
                ζtxt(ζ, 5, 4, 0, " World ");
            }
            ζend(ζ, 1);
        `, '1a');
        assert.deepEqual(t1.statics, [
            'ζs0 = ["class", "main"]',
            'ζs1 = ["class", "foo", "enabled", true, "col", 2]'
        ], '1b');

        let t2 = await test.template(`() => {
            <div [className]="main">
                <span class="foo" [enabled]=true [col] = 2> # Hello # </span>
                <section> # World # </section>
            </>
        }`);
        assert.equal(t2.body, `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζelt(ζ, 1, 1, 0, "div", ζu, ζs0);
                ζelt(ζ, 2, 1, 0, "span", ζs1, ζs2);
                ζtxt(ζ, 3, 2, 0, " Hello ");
                ζelt(ζ, 4, 1, 0, "section");
                ζtxt(ζ, 5, 4, 0, " World ");
            }
            ζend(ζ, 1);
        `, '2a');
        assert.deepEqual(t2.statics, [
            'ζs0 = ["className", "main"]',
            'ζs1 = ["class", "foo"]',
            'ζs2 = ["enabled", true, "col", 2]'
        ], '2b');
    });

    it("should support orphan attributes", async function () {
        let t1 = await test.template(`() => {
            <div disabled/>
        }`);
        assert.equal(t1.body, `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζelt(ζ, 1, 1, 0, "div", ζs0);
            }
            ζend(ζ, 1);
        `, '1a');
        assert.deepEqual(t1.statics, [
            'ζs0 = ["disabled", true]'
        ], '1b');

    });

    it("should support dynamic attributes", async function () {
        assert.equal(await body.template(`(name) => {
            <div title={exp()+123}>
                <span class={getClass()}/>
            </div>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζelt(ζ, 1, 1, 0, "div");
                ζelt(ζ, 2, 1, 0, "span");
            }
            ζatt(ζ, 1, 0, "title", ζe(ζ, 0, 1, exp()+123));
            ζatt(ζ, 2, 0, "class", ζe(ζ, 1, 1, getClass()));
            ζend(ζ, 1);
        `, '1');
    });

    it("should support dynamic properties", async function () {
        assert.equal(await body.template(`(name) => {
            <div [title]={exp()+123}>
                <span [className]={::getClass()}/>
            </div>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζelt(ζ, 1, 1, 0, "div");
                ζelt(ζ, 2, 1, 0, "span");
            }
            ζprop(ζ, 1, 0, "title", ζe(ζ, 0, 1, exp()+123));
            ζprop(ζ, 2, 0, "className", ζc1 ? getClass() : ζu);
            ζend(ζ, 1);
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
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0, " fragment 1 ");
                ζfrag(ζ, 3, 1, 0);
                ζelt(ζ, 4, 3, 0, "div");
                ζtxt(ζ, 5, 4, 0, " fragment 2 ");
            }
            ζend(ζ, 1);
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
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0, " Something ");
                ζtxt(ζ, 3, 1, 0, " Something else ");
            }
            let x = 42;
            x++;
            let bar = { a:"xyz"};
            ζend(ζ, 1);
        `, 'statements first and embedded');

        assert.equal(await body.template(`() => {
            # Something #
            do {
                callSomething();
            } while (test);
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0, " Something ");
            }
            do {
                callSomething();
            } while (test);
            ζend(ζ, 1);
        `, 'statements last');
    });

    it("should support js blocks", async function () {
        assert.equal(await body.template(`(name) => {
            if (test) {
                # Hello {name} #
            }
            # \(end) #
        }`), `
            let ζc1, ζi4 = 0, ζc4;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζfrag(ζ, 2, 1, 0, 1);
                ζtxt(ζ, 3, 1, 0, " ");
            }
            if (test) {
                ζi4++;
                if (ζc4 = ζcheck(ζ, 4, ζi4)) {
                    ζtxt(ζ, 4, 2, 0);
                }
                ζtxtval(ζ, 4, 0, ζs0, 1, ζe(ζ, 0, 4, name));
                ζend(ζ, 4);
            }
            ζclean(ζ, 4, 0);
            ζend(ζ, 1);
        `, 'first position');

        assert.equal(await body.template(`(name) => {
            if (test) {
                # A {name} #
            } else {
                # B {name} #
            }
        }`), `
            let ζc1, ζi4 = 0, ζc4, ζi5 = 0, ζc5;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζfrag(ζ, 2, 1, 0, 1);
                ζfrag(ζ, 3, 1, 0, 1);
            }
            if (test) {
                ζi4++;
                if (ζc4 = ζcheck(ζ, 4, ζi4)) {
                    ζtxt(ζ, 4, 2, 0);
                }
                ζtxtval(ζ, 4, 0, ζs0, 1, ζe(ζ, 0, 4, name));
                ζend(ζ, 4);
            } else {
                ζi5++;
                if (ζc5 = ζcheck(ζ, 5, ζi5)) {
                    ζtxt(ζ, 5, 3, 0);
                }
                ζtxtval(ζ, 5, 0, ζs1, 1, ζe(ζ, 0, 5, name));
                ζend(ζ, 5);
            }
            ζclean(ζ, 4, 0);
            ζclean(ζ, 5, 0);
            ζend(ζ, 1);
        `, 'all / if+else');

        assert.equal(await body.template(`(name) => {
            # hello #
            do {
                let x=123;
                # A {name} #
            } while (test)
        }`), `
            let ζc1, ζi4 = 0, ζc4;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0, " hello ");
                ζfrag(ζ, 3, 1, 0, 1);
            }
            do {
                ζi4++;
                if (ζc4 = ζcheck(ζ, 4, ζi4)) {
                    ζfrag(ζ, 4, 3, 0);
                    ζtxt(ζ, 5, 4, 0);
                }
                let x=123;
                ζtxtval(ζ, 5, 0, ζs0, 1, ζe(ζ, 0, 4, name));
                ζend(ζ, 4);
            } while (test)
            ζclean(ζ, 4, 0);
            ζend(ζ, 1);
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
            let ζc1, ζi4 = 0, ζc4, ζi5 = 0, ζc5;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζfrag(ζ, 2, 1, 0, 1);
                ζfrag(ζ, 3, 1, 0, 1);
            }
            if (a) {
                ζi4++;
                if (ζc4 = ζcheck(ζ, 4, ζi4)) {
                    ζtxt(ζ, 4, 2, 0);
                }
                ζtxtval(ζ, 4, 0, ζs0, 1, ζe(ζ, 0, 4, name));
                ζend(ζ, 4);
            } let x=1;
            if (b) {
                ζi5++;
                if (ζc5 = ζcheck(ζ, 5, ζi5)) {
                    ζtxt(ζ, 5, 3, 0);
                }
                ζtxtval(ζ, 5, 0, ζs1, 1, ζe(ζ, 0, 5, name));
                ζend(ζ, 5);
            }
            ζclean(ζ, 4, 0);
            ζclean(ζ, 5, 0);
            ζend(ζ, 1);
        `, 'series of block & statements');

        assert.equal(await body.template(`(name) => {
            <span/>
            if (a) {
                # A {name} #
                <div/>
            }
            <section/>
        }`), `
            let ζc1, ζi5 = 0, ζc5;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζelt(ζ, 2, 1, 0, "span");
                ζfrag(ζ, 3, 1, 0, 1);
                ζelt(ζ, 4, 1, 0, "section");
            }
            if (a) {
                ζi5++;
                if (ζc5 = ζcheck(ζ, 5, ζi5)) {
                    ζfrag(ζ, 5, 3, 0);
                    ζtxt(ζ, 6, 5, 0);
                    ζelt(ζ, 7, 5, 0, "div");
                }
                ζtxtval(ζ, 6, 0, ζs0, 1, ζe(ζ, 0, 5, name));
                ζend(ζ, 5);
            }
            ζclean(ζ, 5, 0);
            ζend(ζ, 1);
        `, 'embedded & multiple child nodes');

        assert.equal(await body.template(`(name) => {
            if (a) {
                if (b) {
                    <span/>
                }
                <div/>
            }
        }`), `
            let ζc1, ζi2 = 0, ζc2, ζi5 = 0, ζc5;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0, 1);
            }
            if (a) {
                ζi2++;
                if (ζc2 = ζcheck(ζ, 2, ζi2)) {
                    ζfrag(ζ, 2, 1, 0);
                    ζfrag(ζ, 3, 2, 0, 1);
                    ζelt(ζ, 4, 2, 0, "div");
                }
                if (b) {
                    ζi5++;
                    if (ζc5 = ζcheck(ζ, 5, ζi5)) {
                        ζelt(ζ, 5, 3, 0, "span");
                    }
                    ζend(ζ, 5);
                }
                ζclean(ζ, 5, 0);
                ζend(ζ, 2);
            }
            ζclean(ζ, 2, 0);
            ζend(ζ, 1);
        `, 'embedded & multiple child nodes');
    });

    it("should support components with no content", async function () {
        let t1 = await test.template(`() => {
            <$alert class="important" position="bottom"/>
        }`);

        assert.equal(t1.body, `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0, 1);
            }
            ζcpt(ζ, 1, 0, ζe(ζ, 0, 1, alert), 0, 0, ζs0);
            ζcall(ζ, 1, 0);
            ζend(ζ, 1);
        `, '1a');

        assert.deepEqual(t1.statics, [
            'ζs0 = ["class", "important", "position", "bottom"]'
        ], '1b');

        // with dynamic params
        let t2 = await test.template(`() => {
            <$b.section position={getPosition()} msg={myMessage} type="big" important/>
        }`);
        assert.equal(t2.body, `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0, 1);
            }
            ζcpt(ζ, 1, 0, ζe(ζ, 0, 1, b.section), 0, 0, ζs0);
            ζparam(ζ, 1, 0, "position", ζe(ζ, 1, 1, getPosition()));
            ζparam(ζ, 1, 0, "msg", ζe(ζ, 2, 1, myMessage));
            ζcall(ζ, 1, 0);
            ζend(ζ, 1);
        `, '2a');
        assert.deepEqual(t2.statics, [
            'ζs0 = ["type", "big", "important", true]'
        ], '2b');
    });

    it("should support components with content & no param nodes", async function () {
        assert.equal(await body.template(`() => {
            <$myComponent>
                <span title={getTitle()}/>
            </>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0, 1);
                ζelt(ζ, 2, 1, 2, "span");
            }
            ζcpt(ζ, 1, 0, ζe(ζ, 0, 1, myComponent), 2, 0);
            ζatt(ζ, 2, 2, "title", ζe(ζ, 0, 2, getTitle()));
            ζcall(ζ, 1, 0);
            ζend(ζ, 1);
        `, 'single node + dynamic param');

        assert.equal(await body.template(`() => {
            <$myComponent>
                # hello {name1} #
                <$otherComponent p1={expr()}>
                    # hello {name2} #
                </>
            </>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0, 1);
                ζfrag(ζ, 2, 1, 2);
                ζtxt(ζ, 3, 2, 2);
                ζfrag(ζ, 4, 2, 2, 1);
                ζtxt(ζ, 5, 4, 5);
            }
            ζcpt(ζ, 1, 0, ζe(ζ, 0, 1, myComponent), 2, 0);
            ζtxtval(ζ, 3, 2, ζs0, 1, ζe(ζ, 0, 2, name1));
            ζcpt(ζ, 4, 2, ζe(ζ, 1, 2, otherComponent), 5, 0);
            ζparam(ζ, 4, 2, "p1", ζe(ζ, 2, 2, expr()));
            ζtxtval(ζ, 5, 5, ζs1, 1, ζe(ζ, 0, 5, name2));
            ζcall(ζ, 4, 2);
            ζcall(ζ, 1, 0);
            ζend(ζ, 1);
        `, 'multiple nodes & sub-component');
    });

    it("should support components with content & param nodes", async function () {
        assert.equal(await body.template(`() => {
            # first #
            <$myComponent>
                <.header position="top" foo={bar()}/>
                # some content {baz()} #
                <.footer type="small"/>
            </>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0, " first ");
                ζfrag(ζ, 3, 1, 0, 1);
                ζfrag(ζ, 4, 3, 4);
                ζpnode(ζ, 5, 4, 0, "header", ζs0);
                ζtxt(ζ, 6, 4, 4);
                ζpnode(ζ, 7, 4, 0, "footer", ζs1);
            }
            ζcpt(ζ, 3, 0, ζe(ζ, 0, 1, myComponent), 4, 0);
            ζparam(ζ, 5, 0, "foo", ζe(ζ, 0, 4, bar()));
            ζtxtval(ζ, 6, 4, ζs2, 1, ζe(ζ, 1, 4, baz()));
            ζcall(ζ, 3, 0);
            ζend(ζ, 1);
        `, '1');

        assert.equal(await body.template(`() => {
            # first #
            <$myComponent>
                <.header position="top" foo={bar()}>
                    <.title> <b> # Complex {exp()} # </b> </.title>
                    # header content #
                </>
                # cpt content {foo()} #
            </>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζtxt(ζ, 2, 1, 0, " first ");
                ζfrag(ζ, 3, 1, 0, 1);
                ζfrag(ζ, 4, 3, 4);
                ζpnode(ζ, 5, 4, 0, "header", ζs0);
                ζfrag(ζ, 6, 5, 6);
                ζpnode(ζ, 7, 6, 5, "title");
                ζelt(ζ, 8, 7, 8, "b");
                ζtxt(ζ, 9, 8, 8);
                ζtxt(ζ, 10, 6, 6, " header content ");
                ζtxt(ζ, 11, 4, 4);
            }
            ζcpt(ζ, 3, 0, ζe(ζ, 0, 1, myComponent), 4, 0);
            ζparam(ζ, 5, 0, "foo", ζe(ζ, 0, 4, bar()));
            ζtxtval(ζ, 9, 8, ζs1, 1, ζe(ζ, 0, 8, exp()));
            ζtxtval(ζ, 11, 4, ζs2, 1, ζe(ζ, 1, 4, foo()));
            ζcall(ζ, 3, 0);
            ζend(ζ, 1);
        `, '2');

    });

    it("should not create content fragments for content with single js statements block", async function () {
        assert.equal(await body.template(`() => {
            <span>
                let x=123;
            </span>
            <$foo>
                let bar=foo;
            </>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0);
                ζelt(ζ, 2, 1, 0, "span");
                ζfrag(ζ, 3, 1, 0, 1);
            }
            let x=123;
            ζcpt(ζ, 3, 0, ζe(ζ, 0, 1, foo), 0, 0);
            let bar=foo;
            ζcall(ζ, 3, 0);
            ζend(ζ, 1);
        `, '1');
    });

    it("should not create content fragments components with only param nodes and js statements", async function () {
        assert.equal(await body.template(`() => {
            <$foo>
                <.paramA value="a"/>
                let bar=foo;
                <.paramB value={exp(bar)}/>
            </>
        }`), `
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζfrag(ζ, 1, 1, 0, 1);
                ζpnode(ζ, 2, 1, 0, "paramA", ζs0);
                ζpnode(ζ, 3, 1, 0, "paramB");
            }
            ζcpt(ζ, 1, 0, ζe(ζ, 0, 1, foo), 0, 0);
            let bar=foo;
            ζparam(ζ, 3, 0, "value", ζe(ζ, 1, 1, exp(bar)));
            ζcall(ζ, 1, 0);
            ζend(ζ, 1);
        `, '1');
    });

    it("should generate the full template function", async function () {
        let t1 = await test.template(`() => {
            <div class="main">
                <$b.section type="important">
                    <.header> # The big title #</>
                    <span class="content"> # Section content # </>
                </>
            </>
        }`);

        assert.equal(t1.function, `\
(function () {
        const ζs0 = ["class", "main"], ζs1 = ["type", "important"], ζs2 = ["class", "content"];
        return ζt(function (ζ) {
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζelt(ζ, 1, 1, 0, "div", ζs0);
                ζfrag(ζ, 2, 1, 0, 1);
                ζfrag(ζ, 3, 2, 3);
                ζpnode(ζ, 4, 3, 0, "header");
                ζtxt(ζ, 5, 4, 5, " The big title ");
                ζelt(ζ, 6, 3, 3, "span", ζs2);
                ζtxt(ζ, 7, 6, 3, " Section content ");
            }
            ζcpt(ζ, 2, 0, ζe(ζ, 0, 1, b.section), 3, 0, ζs1);
            ζcall(ζ, 2, 0);
            ζend(ζ, 1);
        })
})();` , 'f1');
        assert.deepEqual(t1.importMap, {
            "ζelt": 1, "ζfrag": 1, "ζpnode": 1, "ζtxt": 1, "ζcheck": 1, "ζcpt": 1, "ζe": 1, "ζcall": 1, "ζend": 1, "ζt": 1
        }, 'imports 1');

        let t2 = await test.template(`(name) => {
            <div class="msg" [title]={"Message for " + name}>
                # Hello {name} #
            </>
        }`);
        assert.equal(t2.function, `\
(function () {
        const ζs0 = ["class", "msg"], ζs1 = [" Hello ", " "];
        @ζd class ζParams {
            @ζv name;
        }
        return ζt(function (ζ, name) {
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζelt(ζ, 1, 1, 0, "div", ζs0);
                ζtxt(ζ, 2, 1, 0);
            }
            ζprop(ζ, 1, 0, "title", ζe(ζ, 0, 1, "Message for " + name));
            ζtxtval(ζ, 2, 0, ζs1, 1, ζe(ζ, 1, 1, name));
            ζend(ζ, 1);
        }, 0, ζParams)
})();` , 'f2');
        assert.deepEqual(t2.importMap, {
            "ζelt": 1, "ζtxt": 1, "ζcheck": 1, "ζe": 1, "ζtxtval": 1, "ζend": 1, "ζv": 1, "ζd": 1, "ζt": 1
        }, 'imports 2');

        let t3 = await test.template(`(firstName, lastName) => {
            # Hello {firstName} {::lastName} #
        }`);
        assert.equal(t3.function, `\
(function () {
        const ζs0 = [" Hello ", " ", " "];
        @ζd class ζParams {
            @ζv firstName;
            @ζv lastName;
        }
        return ζt(function (ζ, firstName, lastName) {
            let ζc1;
            if (ζc1 = ζcheck(ζ, 1, 0)) {
                ζtxt(ζ, 1, 1, 0);
            }
            ζtxtval(ζ, 1, 0, ζs0, 2, ζe(ζ, 0, 1, firstName), ζc1 ? lastName : ζu);
            ζend(ζ, 1);
        }, 0, ζParams)
})();` , 'f3');
        assert.deepEqual(t3.importMap, {
            "ζtxt": 1, "ζcheck": 1, "ζtxtval": 1, "ζe": 1, "ζu": 1, "ζend": 1, "ζv": 1, "ζd": 1, "ζt": 1
        }, 'imports 3');
    });

    it("should support import re-injection", async function () {
        let t1 = await test.template(`() => {
            <div class="main">
                let x=123;
                # x = {x} #
            </>
        }`);
        assert.deepEqual(t1.importMap, {
            "ζelt": 1, "ζtxt": 1, "ζcheck": 1, "ζtxtval": 1, "ζe": 1, "ζend": 1, "ζt": 1
        }, "t1 imports");

        let t2 = await test.template(`(comp) => {
            <$comp/>
        }`, t1.importMap);
        assert.deepEqual(t2.importMap, {
            "ζelt": 1, "ζtxt": 1, "ζcheck": 1, "ζtxtval": 1, "ζe": 1, "ζend": 1, "ζt": 1, "ζfrag": 1, "ζcpt": 1, "ζcall": 1, "ζv": 1, "ζd": 1
        }, "t2 imports");
    });

    // todo param nodes as root nodes + ζt flag indicating that function generates root param nodes
    // todo support external param class through ($params:MyParamClass) => { }
});
