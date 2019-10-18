import * as assert from 'assert';
import { template, asyncComplete } from '../../iv';
import { ElementNode, reset, getTemplate, stringify, logNodes } from '../utils';

describe('Xmlns', () => {
    let body: ElementNode;

    beforeEach(() => {
        body = reset();
    });

    it("should be supported as standard attribute", function () {
        const foo = template(`(name, condition = false) => {
            <div>
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle r="48"/>
                    if (condition) {
                        <line y1="10" y2="0"/>
                    }
                </>
            </div>
        }`);

        const t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <svg::E4 SVG a:viewBox="0 0 100 100" a:xmlns="http://www.w3.org/2000/svg">
                        <circle::E5 SVG a:r="48"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <svg::E4 SVG a:viewBox="0 0 100 100" a:xmlns="http://www.w3.org/2000/svg">
                        <circle::E5 SVG a:r="48"/>
                        <line::E6 SVG a:y1="10" a:y2="0"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should be supported through @xmlns", function () {
        const foo = template(`(name, condition = false) => {
            <div>
                <svg viewBox="0 0 100 100" @xmlns="svg">
                    <circle r="48"/>
                    if (condition) {
                        <line y1="10" y2="0"/>
                    }
                </>
            </div>
        }`);

        const t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <svg::E4 SVG a:viewBox="0 0 100 100">
                        <circle::E5 SVG a:r="48"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <svg::E4 SVG a:viewBox="0 0 100 100">
                        <circle::E5 SVG a:r="48"/>
                        <line::E6 SVG a:y1="10" a:y2="0"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

    it("should be potentially nested", function () {
        const foo = template(`(name, condition = false) => {
            <div>
                <svg viewBox="0 0 100 100" @xmlns="svg">
                    <circle r="1"/>
                    <div @xmlns="html">
                        <div> # Some text # </div>
                    </div>
                    <circle r="2"/>
                </>
            </div>
        }`);

        const t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <svg::E4 SVG a:viewBox="0 0 100 100">
                        <circle::E5 SVG a:r="1"/>
                        <div::E6 HTML>
                            <div::E7 HTML>
                                #::T8 Some text #
                            </div>
                        </div>
                        <circle::E9 SVG a:r="2"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("should be defaulted in sub-templates", function () {
        const foo = template(`() => {
            <! @xmlns="svg">
                <*bar/>
            </!>
        }`);

        const bar = template(`() => {\
            <svg viewBox="0 0 100 100">
                <circle r="48"/>
            </>
        }`);

        const t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <svg::E3 SVG a:viewBox="0 0 100 100">
                    <circle::E4 SVG a:r="48"/>
                </svg>
                //::C2 template anchor
            </body>
        `, '1');
    });

    it("should be supported in template content", function () {
        const foo = template(`(condition=true, radius=42) => {
            <*bar>
                if (condition) {
                    <svg viewBox="0 0 100 100" @xmlns="svg">
                        <circle r={radius}/>
                    </>
                }
            </*bar>
        }`);

        const bar = template(`($content) => {
            <div class="bar" @content/>
        }`);

        const t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="bar">
                    <svg::E4 SVG a:viewBox="0 0 100 100">
                        <circle::E5 SVG a:r="42"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: false });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="bar"/>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: true, radius: 64 });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3 a:class="bar">
                    <svg::E4 SVG a:viewBox="0 0 100 100">
                        <circle::E5 SVG a:r="64"(1)/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should be supported in template content with no svg tag + no explicit xmlns", function () {
        const foo = template(`(condition=true, radius=42) => {
            <svg viewBox="0 0 100 100">
                <*bar>
                    if (condition) {
                        <circle r={radius}/>
                    }
                </>
            </>
        }`);

        const bar = template(`($content) => {
            <! @content/>
        }`);

        const t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <svg::E3 SVG a:viewBox="0 0 100 100">
                    <circle::E4 SVG a:r="42"/>
                </svg>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: false });
        assert.equal(stringify(t), `
            <body::E1>
                <svg::E3 SVG a:viewBox="0 0 100 100"/>
                //::C2 template anchor
            </body>
        `, '2');

        t.render({ condition: true, radius: 64 });
        assert.equal(stringify(t), `
            <body::E1>
                <svg::E3 SVG a:viewBox="0 0 100 100">
                    <circle::E4 SVG a:r="64"(1)/>
                </svg>
                //::C2 template anchor
            </body>
        `, '3');
    });

    it("should not be automatically set on svg elements if another xmlns is explicitly defined", function () {
        const foo = template(`(name, condition = false) => {
            <div>
                <svg viewBox="0 0 100 100" @xmlns="html">
                    <circle r="48"/>
                    if (condition) {
                        <line y1="10" y2="0"/>
                    }
                </>
            </div>
        }`);

        const t = getTemplate(foo, body).render();
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <svg::E4 HTML a:viewBox="0 0 100 100">
                        <circle::E5 HTML a:r="48"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '1');

        t.render({ condition: true });
        assert.equal(stringify(t), `
            <body::E1>
                <div::E3>
                    <svg::E4 HTML a:viewBox="0 0 100 100">
                        <circle::E5 HTML a:r="48"/>
                        <line::E6 HTML a:y1="10" a:y2="0"/>
                    </svg>
                </div>
                //::C2 template anchor
            </body>
        `, '2');
    });

});
