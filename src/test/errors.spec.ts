// iv:ignore
import { error } from './utils';
import * as assert from 'assert';

describe('Code generation errors', () => {

    it("should be raised for invalid fragments", async function () {
        assert.equal(await error.template(`($content) => {
            <! foo="bar"> # abc # </>
        }`), `
            Invalid fragment - Params cannot be used on fragments
            File: file.ts - Line 2 / Col 13
            Extract: >> <! foo="bar"> # abc # </> <<
        `);
    });

    // errors on 1st template line (col number)

    // it("should be raised for invalid @content", async function () {
    //     assert.equal(await error.template(`() => {
    //         <div @content/>
    //     }`), 'Invalid decorator - $content must be defined as template argument to use @content without expressions (line #2)', '1');

    //     assert.equal(await error.template(`($content) => {
    //         <div @content>
    //             # some text #
    //         </div>
    //     }`), 'Invalid decorator - @content can only be used on empty elements or fragments (line #2)', '2');

    //     assert.equal(await error.template(`($content) => {
    //         <*cpt @content={$content}/>
    //     }`), 'Invalid decorator - @content can only be used on elements or fragments (line #2)', '3');

    //     assert.equal(await error.template(`($content) => {
    //         <div @content="abcd"/>
    //     }`), 'Invalid decorator - @content value cannot be a #string (line #2)', '4');

    //     assert.equal(await error.template(`($content) => {
    //         <div @content={::$content}/>
    //     }`), 'Invalid decorator - @content expression cannot use one-time qualifier (line #2)', '5');
    // });

    // it("should be raised for invalid @async", async function () {
    //     // @async is only valid on fragments, elements and components and only accepts number or expressions

    //     assert.equal(await error.template(`() => {
    //         <div @async=true/>
    //     }`), 'Invalid decorator - @async value must be either empty or a number or an expression (line #2)', '1');

    //     assert.equal(await error.template(`() => {
    //         <div @async="abc"/>
    //     }`), 'Invalid decorator - @async value must be either empty or a number or an expression (line #2)', '1');

    //     assert.equal(await error.template(`() => {
    //         # (@async) Some text #
    //     }`), 'Invalid decorator - @async cannot be used in this context (line #2)', '1');

    //     assert.equal(await error.template(`() => {
    //         <*section title="foo">
    //             <.header @async> # Header # </>
    //             # Content #
    //         </>
    //     }`), 'Invalid decorator - @async cannot be used in this context (line #3)', '1');
    // });

});
