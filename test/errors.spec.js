/**
 * IV error tests
 * Copyright Bertrand Laporte 2016
 * Created on 28/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {iv} from '../src/iv/iv';

describe('IV errors', () => {
    let originalLog = iv.log, lastError = null;

    function errlog(err) {
        lastError = err;
    }

    beforeEach(() => {
        iv.log = errlog;
        lastError = null;
    });

    afterEach(() => {
        iv.log = originalLog;
    });

    // it('should be raised when no content attribute is defined but content is passed', () => {
    //     let pkg = iv`
    //             <function #test>
    //                 <panel>
    //                     Some content
    //                 </panel>
    //             </function>
    //
    //             <function #panel title="" />
    //         `;
    //
    //     pkg.test.createView();
    //     expect(lastError.description()).toBe("[#foo/panel] Content not supported by this component");
    // });


    it('should be raised when no type information is passed for IvNode attributes', () => {
        let pkg = iv`
            <function #test>
                <panel>
                    <:title> Hello </:title>
                </panel>
            </function>

            <function #panel title="" />
        `;

        pkg.test.createView();
        expect(lastError.description()).toBe("[:title@line:4] Type description not found");
    });

    it('should be raised when invalid type information is passed for IvNode attributes', () => {
        let pkg = iv`

            <function #test>
                <panel>
                    <:title> Hello </:title>
                </panel>
            </function>

            <function #panel title:String="" />
        `;

        pkg.test.createView();
        expect(lastError.description()).toBe("[:title@line:5] Type mismatch");
    });
});
