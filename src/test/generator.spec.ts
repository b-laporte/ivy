// iv:ignore
import { body, statics, test } from './utils';
import * as assert from 'assert';

describe('Code generator', () => {

    it("should support static text nodes", async function () {
        assert.equal(await body.template(`() => {
            # Hello World #
        }`), `
            if (ζ1[0].cm) {
                ζtxt(ζ1, 1, 1, 0, " Hello World ");
            }
            ζend(ζ1);
        `, '1');

        assert.equal(await body.template(`() => {
            # Hello #
            # World #
        }`), `
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, " Hello ");
                ζtxt(ζ1, 3, 1, 0, " World ");
            }
            ζend(ζ1);
        `, '2');
    });

    it("should support dynamic text nodes and expressions", async function () {
        assert.equal(await body.template(`(name) => {
            # Hello {name} #
        }`), `
            if (ζ1[0].cm) {
                ζtxt(ζ1, 1, 1, 0, ζs0);
            }
            ζtxtval(ζ1, 1, 0, 1, ζe(ζ1, 0, name));
            ζend(ζ1);
        `, '1');

        assert.deepEqual(await statics.template(`(name) => {
            # Hello {name} #
        }` ), [
                'ζs0 = [" Hello ", "", " "]'
            ], '2');

        assert.equal(await body.template(`(name) => {
            # Hello {name} #
            # {name+1} {::name+2} #
        }`), `
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, ζs0);
                ζtxt(ζ1, 3, 1, 0, ζs1);
            }
            ζtxtval(ζ1, 2, 0, 1, ζe(ζ1, 0, name));
            ζtxtval(ζ1, 3, 0, 2, ζe(ζ1, 1, name+1), ζo(ζ1, 0)? name+2 : ζu);
            ζend(ζ1);
        `, '3');

        assert.deepEqual(await statics.template(`(name) => {
            # Hello {name}#
            # {name+1} {::name+2} #
        }` ), [
                'ζs0 = [" Hello ", ""]',
                'ζs1 = [" ", "", " ", "", " "]'
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
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div");
                ζfrag(ζ1, 2, 1);
                ζtxt(ζ1, 3, 2, 0, ζs0);
                ζelt(ζ1, 4, 2, 0, "span");
                ζtxt(ζ1, 5, 4, 0, ζs1);
            }
            ζtxtval(ζ1, 3, 0, 1, ζe(ζ1, 0, name));
            ζtxtval(ζ1, 5, 0, 1, ζe(ζ1, 1, name));
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div", ζs0);
                ζelt(ζ1, 2, 1, 0, "span", ζs1);
                ζtxt(ζ1, 3, 2, 0, " Hello ");
                ζelt(ζ1, 4, 1, 0, "span");
                ζtxt(ζ1, 5, 4, 0, " World ");
            }
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div", ζu, ζs0);
                ζelt(ζ1, 2, 1, 0, "span", ζs1, ζs2);
                ζtxt(ζ1, 3, 2, 0, " Hello ");
                ζelt(ζ1, 4, 1, 0, "section");
                ζtxt(ζ1, 5, 4, 0, " World ");
            }
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div", ζs0);
            }
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div");
                ζelt(ζ1, 2, 1, 0, "span");
            }
            ζatt(ζ1, 1, 0, "title", ζe(ζ1, 0, exp()+123));
            ζatt(ζ1, 2, 0, "class", ζe(ζ1, 1, getClass()));
            ζend(ζ1);
        `, '1');
    });

    it("should support dynamic properties", async function () {
        assert.equal(await body.template(`(name) => {
            <div [title]={exp()+123}>
                <span [className]={::getClass()}/>
            </div>
        }`), `
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div");
                ζelt(ζ1, 2, 1, 0, "span");
            }
            ζprop(ζ1, 1, 0, "title", ζe(ζ1, 0, exp()+123));
            ζprop(ζ1, 2, 0, "className", ζo(ζ1, 0)? getClass() : ζu);
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, " fragment 1 ");
                ζfrag(ζ1, 3, 1);
                ζelt(ζ1, 4, 3, 0, "div");
                ζtxt(ζ1, 5, 4, 0, " fragment 2 ");
            }
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, " Something ");
                ζtxt(ζ1, 3, 1, 0, " Something else ");
            }
            let x = 42;
            x++;
            let bar = { a:"xyz"};
            ζend(ζ1);
        `, 'statements first and embedded');

        assert.equal(await body.template(`() => {
            # Something #
            do {
                callSomething();
            } while (test);
        }`), `
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, " Something ");
            }
            do {
                callSomething();
            } while (test);
            ζend(ζ1);
        `, 'statements last');
    });

    it("should support js blocks", async function () {
        assert.equal(await body.template(`(name) => {
            if (test) {
                # Hello {name} #
            }
            # \\(end) #
        }`), `
            let ζi2 = 0, ζ2;
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζfrag(ζ1, 2, 1, 0, 1);
                ζtxt(ζ1, 3, 1, 0, " \\(end) ");
            }
            if (test) {
                ζ2 = ζcc(ζ1, 2, ++ζi2);
                if (ζ2[0].cm) {
                    ζtxt(ζ2, 1, 1, 0, ζs0);
                }
                ζtxtval(ζ2, 1, 0, 1, ζe(ζ2, 0, name));
                ζend(ζ2);
            }
            ζclean(ζ1, 2, 0);
            ζend(ζ1);
        `, 'first position');

        assert.equal(await body.template(`(name) => {
            if (test) {
                # A {name} #
            } else {
                # B {name} #
            }
        }`), `
            let ζi2 = 0, ζ2, ζi3 = 0, ζ3;
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζfrag(ζ1, 2, 1, 0, 1);
                ζfrag(ζ1, 3, 1, 0, 1);
            }
            if (test) {
                ζ2 = ζcc(ζ1, 2, ++ζi2);
                if (ζ2[0].cm) {
                    ζtxt(ζ2, 1, 1, 0, ζs0);
                }
                ζtxtval(ζ2, 1, 0, 1, ζe(ζ2, 0, name));
                ζend(ζ2);
            } else {
                ζ3 = ζcc(ζ1, 3, ++ζi3);
                if (ζ3[0].cm) {
                    ζtxt(ζ3, 1, 1, 0, ζs1);
                }
                ζtxtval(ζ3, 1, 0, 1, ζe(ζ3, 0, name));
                ζend(ζ3);
            }
            ζclean(ζ1, 2, 0);
            ζclean(ζ1, 3, 0);
            ζend(ζ1);
        `, 'all / if+else');

        assert.equal(await body.template(`(name) => {
            # hello #
            do {
                let x=123;
                # A {name} #
            } while (test)
        }`), `
            let ζi2 = 0, ζ2;
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, " hello ");
                ζfrag(ζ1, 3, 1, 0, 1);
            }
            do {
                ζ2 = ζcc(ζ1, 3, ++ζi2);
                if (ζ2[0].cm) {
                    ζfrag(ζ2, 1, 1);
                    ζtxt(ζ2, 2, 1, 0, ζs0);
                }
                let x=123;
                ζtxtval(ζ2, 2, 0, 1, ζe(ζ2, 0, name));
                ζend(ζ2);
            } while (test)
            ζclean(ζ1, 3, 0);
            ζend(ζ1);
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
            let ζi2 = 0, ζ2, ζi3 = 0, ζ3;
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζfrag(ζ1, 2, 1, 0, 1);
                ζfrag(ζ1, 3, 1, 0, 1);
            }
            if (a) {
                ζ2 = ζcc(ζ1, 2, ++ζi2);
                if (ζ2[0].cm) {
                    ζtxt(ζ2, 1, 1, 0, ζs0);
                }
                ζtxtval(ζ2, 1, 0, 1, ζe(ζ2, 0, name));
                ζend(ζ2);
            } let x=1;
            if (b) {
                ζ3 = ζcc(ζ1, 3, ++ζi3);
                if (ζ3[0].cm) {
                    ζtxt(ζ3, 1, 1, 0, ζs1);
                }
                ζtxtval(ζ3, 1, 0, 1, ζe(ζ3, 0, name));
                ζend(ζ3);
            }
            ζclean(ζ1, 2, 0);
            ζclean(ζ1, 3, 0);
            ζend(ζ1);
        `, 'series of block & statements');

        assert.equal(await body.template(`(name) => {
            <span/>
            if (a) {
                # A {name} #
                <div/>
            }
            <section/>
        }`), `
            let ζi2 = 0, ζ2;
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζelt(ζ1, 2, 1, 0, "span");
                ζfrag(ζ1, 3, 1, 0, 1);
                ζelt(ζ1, 4, 1, 0, "section");
            }
            if (a) {
                ζ2 = ζcc(ζ1, 3, ++ζi2);
                if (ζ2[0].cm) {
                    ζfrag(ζ2, 1, 1);
                    ζtxt(ζ2, 2, 1, 0, ζs0);
                    ζelt(ζ2, 3, 1, 0, "div");
                }
                ζtxtval(ζ2, 2, 0, 1, ζe(ζ2, 0, name));
                ζend(ζ2);
            }
            ζclean(ζ1, 3, 0);
            ζend(ζ1);
        `, 'embedded & multiple child nodes');

        assert.equal(await body.template(`(name) => {
            if (a) {
                if (b) {
                    <span/>
                }
                <div/>
            }
        }`), `
            let ζi2 = 0, ζ2, ζi3 = 0, ζ3;
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1, 0, 1);
            }
            if (a) {
                ζ2 = ζcc(ζ1, 1, ++ζi2);
                if (ζ2[0].cm) {
                    ζfrag(ζ2, 1, 1);
                    ζfrag(ζ2, 2, 1, 0, 1);
                    ζelt(ζ2, 3, 1, 0, "div");
                }
                if (b) {
                    ζ3 = ζcc(ζ2, 2, ++ζi3);
                    if (ζ3[0].cm) {
                        ζelt(ζ3, 1, 1, 0, "span");
                    }
                    ζend(ζ3);
                }
                ζclean(ζ2, 2, 0);
                ζend(ζ2);
            }
            ζclean(ζ1, 1, 0);
            ζend(ζ1);
        `, 'embedded & multiple child nodes');
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
            let ζi2 = 0, ζ2;
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div");
                ζtxt(ζ1, 2, 1, 0, " first ");
                ζfrag(ζ1, 3, 1, 0, 1);
            }
            if (condition) {
                ζ2 = ζcc(ζ1, 3, ++ζi2);
                if (ζ2[0].cm) {
                    ζelt(ζ2, 1, 1, 0, "span");
                }
                ζend(ζ2);
            }
            ζclean(ζ1, 3, 0);
            ζend(ζ1);
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
            let ζi2 = 0, ζ2, ζi3 = 0, ζ3;
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div");
                ζfrag(ζ1, 2, 1);
                ζfrag(ζ1, 3, 2, 0, 1);
                ζfrag(ζ1, 4, 1, 0, 1);
            }
            if (condition) {
                ζ2 = ζcc(ζ1, 3, ++ζi2);
                if (ζ2[0].cm) {
                    ζelt(ζ2, 1, 1, 0, "span");
                }
                ζend(ζ2);
            }
            if (condition) {
                ζ3 = ζcc(ζ1, 4, ++ζi3);
                if (ζ3[0].cm) {
                    ζelt(ζ3, 1, 1, 0, "span");
                }
                ζend(ζ3);
            }
            ζclean(ζ1, 3, 0);
            ζclean(ζ1, 4, 0);
            ζend(ζ1);
        `, '2');
    });

    it("should support components with no content", async function () {
        let t1 = await test.template(`() => {
            <$alert class="important" position="bottom"/>
        }`);

        assert.equal(t1.body, `
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1, 0, 1);
            }
            ζcpt(ζ1, 1, 0, ζe(ζ1, 0, alert), 0, 0, ζs0);
            ζcall(ζ1, 1);
            ζend(ζ1);
        `, '1a');

        assert.deepEqual(t1.statics, [
            'ζs0 = ["class", "important", "position", "bottom"]'
        ], '1b');

        // with dynamic params
        let t2 = await test.template(`() => {
            <$b.section position={getPosition()} msg={myMessage} type="big" important/>
        }`);
        assert.equal(t2.body, `
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1, 0, 1);
            }
            ζcpt(ζ1, 1, 0, ζe(ζ1, 0, b.section), 0, 0, ζs0);
            ζparam(ζ1, 1, 0, "position", ζe(ζ1, 1, getPosition()));
            ζparam(ζ1, 1, 0, "msg", ζe(ζ1, 2, myMessage));
            ζcall(ζ1, 1);
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1, 0, 1);
                ζelt(ζ1, 2, 1, 2, "span");
            }
            ζcpt(ζ1, 1, 0, ζe(ζ1, 0, myComponent), 2, 0);
            ζatt(ζ1, 2, 2, "title", ζe(ζ1, 0, getTitle(), 2));
            ζcall(ζ1, 1);
            ζend(ζ1);
        `, 'single node + dynamic param');

        assert.equal(await body.template(`() => {
            <$myComponent>
                # hello {name1} #
                <$otherComponent p1={expr()}>
                    # hello {name2} #
                </>
            </>
        }`), `
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1, 0, 1);
                ζfrag(ζ1, 2, 1, 2);
                ζtxt(ζ1, 3, 2, 2, ζs0);
                ζfrag(ζ1, 4, 2, 2, 1);
                ζtxt(ζ1, 5, 4, 5, ζs1);
            }
            ζcpt(ζ1, 1, 0, ζe(ζ1, 0, myComponent), 2, 0);
            ζtxtval(ζ1, 3, 2, 1, ζe(ζ1, 0, name1, 2));
            ζcpt(ζ1, 4, 2, ζe(ζ1, 1, otherComponent, 2), 5, 0);
            ζparam(ζ1, 4, 2, "p1", ζe(ζ1, 2, expr(), 2));
            ζtxtval(ζ1, 5, 5, 1, ζe(ζ1, 0, name2, 5));
            ζcall(ζ1, 4, 2);
            ζcall(ζ1, 1);
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, " first ");
                ζfrag(ζ1, 3, 1, 0, 1);
                ζfrag(ζ1, 4, 3, 4);
                ζpnode(ζ1, 5, 4, 0, "header", ζs0);
                ζtxt(ζ1, 6, 4, 4, ζs1);
                ζpnode(ζ1, 7, 4, 0, "footer", ζs2);
            }
            ζcpt(ζ1, 3, 0, ζe(ζ1, 0, myComponent), 4, 0);
            ζparam(ζ1, 5, 0, "foo", ζe(ζ1, 1, bar()));
            ζtxtval(ζ1, 6, 4, 1, ζe(ζ1, 0, baz(), 4));
            ζcall(ζ1, 3);
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζtxt(ζ1, 2, 1, 0, " first ");
                ζfrag(ζ1, 3, 1, 0, 1);
                ζfrag(ζ1, 4, 3, 4);
                ζpnode(ζ1, 5, 4, 0, "header", ζs0);
                ζfrag(ζ1, 6, 5, 6);
                ζpnode(ζ1, 7, 6, 4, "title");
                ζelt(ζ1, 8, 7, 8, "b");
                ζtxt(ζ1, 9, 8, 8, ζs1);
                ζtxt(ζ1, 10, 6, 6, " header content ");
                ζtxt(ζ1, 11, 4, 4, ζs2);
            }
            ζcpt(ζ1, 3, 0, ζe(ζ1, 0, myComponent), 4, 0);
            ζparam(ζ1, 5, 0, "foo", ζe(ζ1, 1, bar()));
            ζtxtval(ζ1, 9, 8, 1, ζe(ζ1, 0, exp(), 8));
            ζtxtval(ζ1, 11, 4, 1, ζe(ζ1, 0, foo(), 4));
            ζcall(ζ1, 3);
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1);
                ζelt(ζ1, 2, 1, 0, "span");
                ζfrag(ζ1, 3, 1, 0, 1);
            }
            let x=123;
            ζcpt(ζ1, 3, 0, ζe(ζ1, 0, foo), 0, 0);
            let bar=foo;
            ζcall(ζ1, 3);
            ζend(ζ1);
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
            if (ζ1[0].cm) {
                ζfrag(ζ1, 1, 1, 0, 1);
                ζpnode(ζ1, 2, 1, 0, "paramA", ζs0);
                ζpnode(ζ1, 3, 1, 0, "paramB");
            }
            ζcpt(ζ1, 1, 0, ζe(ζ1, 0, foo), 0, 0);
            let bar=foo;
            ζparam(ζ1, 3, 0, "value", ζe(ζ1, 1, exp(bar)));
            ζcall(ζ1, 1);
            ζend(ζ1);
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

        assert.equal(t1.function, `(function () {
        const ζs0 = ["class", "main"], ζs1 = ["type", "important"], ζs2 = ["class", "content"];
        return ζt(function (ζ1) {
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div", ζs0);
                ζfrag(ζ1, 2, 1, 0, 1);
                ζfrag(ζ1, 3, 2, 3);
                ζpnode(ζ1, 4, 3, 0, "header");
                ζtxt(ζ1, 5, 4, 5, " The big title ");
                ζelt(ζ1, 6, 3, 3, "span", ζs2);
                ζtxt(ζ1, 7, 6, 3, " Section content ");
            }
            ζcpt(ζ1, 2, 0, ζe(ζ1, 0, b.section), 3, 0, ζs1);
            ζcall(ζ1, 2);
            ζend(ζ1);
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
        return ζt(function (ζ1, $) {
            let name = $["name"];
            if (ζ1[0].cm) {
                ζelt(ζ1, 1, 1, 0, "div", ζs0);
                ζtxt(ζ1, 2, 1, 0, ζs1);
            }
            ζprop(ζ1, 1, 0, "title", ζe(ζ1, 0, "Message for " + name));
            ζtxtval(ζ1, 2, 0, 1, ζe(ζ1, 1, name));
            ζend(ζ1);
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
        return ζt(function (ζ1, $) {
            let firstName = $["firstName"], lastName = $["lastName"];
            if (ζ1[0].cm) {
                ζtxt(ζ1, 1, 1, 0, ζs0);
            }
            ζtxtval(ζ1, 1, 0, 2, ζe(ζ1, 0, firstName), ζo(ζ1, 0)? lastName : ζu);
            ζend(ζ1);
        }, 0, ζParams);
        })()` , 'f3');
        assert.deepEqual(t3.importMap, {
            "ζtxt": 1, "ζcc": 1, "ζtxtval": 1, "ζe": 1, "ζu": 1, "ζend": 1, "ζo": 1, "ζv": 1, "ζd": 1, "ζt": 1
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
            "ζelt": 1, "ζtxt": 1, "ζcc": 1, "ζtxtval": 1, "ζe": 1, "ζend": 1, "ζt": 1
        }, "t1 imports");

        let t2 = await test.template(`(comp) => {
            <$comp/>
        }`, t1.importMap);
        assert.deepEqual(t2.importMap, {
            "ζelt": 1, "ζtxt": 1, "ζcc": 1, "ζtxtval": 1, "ζe": 1, "ζend": 1, "ζt": 1, "ζfrag": 1, "ζcpt": 1, "ζcall": 1, "ζv": 1, "ζd": 1
        }, "t2 imports");
    });

    it("should support external Param class definition", async function () {
        let t1 = await test.template(`($:MyParamClass) => {
            # Hello {$.name} #
        }`);
        assert.equal(t1.function, `(function () {
        const ζs0 = [" Hello ", "", " "];
        return ζt(function (ζ1, $) {
            if (ζ1[0].cm) {
                ζtxt(ζ1, 1, 1, 0, ζs0);
            }
            ζtxtval(ζ1, 1, 0, 1, ζe(ζ1, 0, $.name));
            ζend(ζ1);
        }, 0, MyParamClass);
        })()`, 'simple param class');

        let t2 = await test.template(`($:MyParamClass, name) => {
            # Hello {$.name} #
        }`);
        assert.equal(t2.function, `(function () {
        const ζs0 = [" Hello ", "", " "];
        return ζt(function (ζ1, $) {
            let name = $["name"];
            if (ζ1[0].cm) {
                ζtxt(ζ1, 1, 1, 0, ζs0);
            }
            ζtxtval(ζ1, 1, 0, 1, ζe(ζ1, 0, $.name));
            ζend(ζ1);
        }, 0, MyParamClass);
        })()`, 'param class + local variables initialization');
    });

    // todo: change 1 time expressions to ζo(ζ1, 0)? exp() : ζu
    // todo merge clean() and end()
    // todo param nodes as root nodes + ζt flag indicating that function generates root param nodes
});

