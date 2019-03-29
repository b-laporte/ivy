// iv:ignore
import { error } from './utils';
import * as assert from 'assert';

describe('Code generation errors', () => {

    it("should be raised for invalid @content", async function () {
        assert.equal(await error.template(`() => {
            <div @content/>
        }`), 'Invalid decorator - $content must be defined as template argument to use @content without expressions at line #2', '1');

        assert.equal(await error.template(`($content) => {
            <div @content>
                # some text #
            </div>
        }`), 'Invalid decorator - @content can only be used on empty elements or fragments at line #2', '2');

        assert.equal(await error.template(`($content) => {
            <$cpt @content={$content}/>
        }`), 'Invalid decorator - @content can only be used on elements or fragments at line #2', '3');

        assert.equal(await error.template(`($content) => {
            <div @content="abcd"/>
        }`), 'Invalid decorator - @content value cannot be a #string at line #2', '4');

        assert.equal(await error.template(`($content) => {
            <div @content={::$content}/>
        }`), 'Invalid decorator - @content expression cannot use one-time qualifier at line #2', '5');
    });

});
