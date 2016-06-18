/**
 * IV error tests
 * Copyright Bertrand Laporte 2016
 * Created on 28/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {iv} from '../src/iv/iv';

describe('IV errors', () => {
    var originalLog = iv.log, lastError = null;

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

    it('should be raised when no type information is passed for IvNode attributes', () => {
        var pkg = iv`
            <template #test>
                <panel>
                    <div @title> Hello </div>
                </panel>
            </template>
    
            <template #panel title="" />
        `;

        pkg.test.apply();
        expect(lastError.description()).toBe("[template#test/@title] Type description not found for the 'title' attribute -  IvNode or IvObject expected");
    });

    it('should be raised when invalid type information is passed for IvNode attributes', () => {
        var pkg = iv`
            <template #test>
                <panel>
                    <div @title> Hello </div>
                </panel>
            </template>
    
            <template #panel title:string="" />
        `;

        pkg.test.apply();
        expect(lastError.description()).toBe("[template#test/@title] Invalid type for the 'title' attribute: string");
    });
});
