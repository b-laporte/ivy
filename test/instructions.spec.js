/**
 * Created by b-laporte on 05/07/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {IvInstructionPool} from '../src/iv/instructions';
import {IvGroupNode, IvTextNode} from '../src/iv/node';

describe('Iv Instructions', () => {
    var ndGroupTpl = new IvGroupNode(0, "template"),
        ndGroupJs = new IvGroupNode(1, "js"),
        ndGroupInsert = new IvGroupNode(2, "insert"),
        ndText = new IvTextNode(3, "text node");

    it('should create new instructions when pool is empty', () => {
        var pool = new IvInstructionPool();

        expect(pool.first).toBe(null);

        var i1 = pool.getInstruction(1, ndGroupTpl);
        expect(i1.type).toBe(1);
        expect(i1.node).toBe(ndGroupTpl);
        expect(i1.parent).toBe(null);
        expect(i1.next).toBe(null);
    });

    it('should fill the pool with previously generated instructions', () => {
        var pool = new IvInstructionPool();

        expect(pool.first).toBe(null);

        var i1 = pool.getInstruction(1, ndGroupTpl),
            i2 = pool.getInstruction(1, ndGroupJs);
        i1.next = i2;

        pool.addInstructionList(i1, i2);

        expect(pool.getInstruction(3, ndText)).toBe(i1); // i1 is reused with different values
        expect(i1.type).toBe(3);
        expect(i1.node).toBe(ndText);
        expect(i1.parent).toBe(null);
        expect(i1.next).toBe(null);
        expect(pool.first).toBe(i2);
        expect(pool.last).toBe(i2);
        expect(pool.getInstruction(3, ndGroupTpl)).toBe(i2); // i1 is reused with different values
        expect(pool.first).toBe(null);
        expect(pool.last).toBe(null);

        var i3 = pool.getInstruction(4, ndGroupTpl),
            i4 = pool.getInstruction(5, ndGroupJs);
        i1.next = i2;
        i3.next = i4;

        pool.addInstructionList(i1, i2);
        pool.addInstructionList(i3, i4);

        expect(pool.getInstruction(3, ndGroupTpl)).toBe(i1);
        expect(pool.getInstruction(3, ndGroupTpl)).toBe(i2);
        expect(pool.first).toBe(i3);
        expect(pool.last).toBe(i4);
        expect(pool.getInstruction(3, ndGroupTpl)).toBe(i3);
        expect(pool.getInstruction(3, ndGroupTpl)).toBe(i4);
        expect(pool.first).toBe(null);
        expect(pool.last).toBe(null);
    });
});
