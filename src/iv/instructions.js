/**
 * Created by b-laporte on 05/07/16.
 */

export class IvInstructionPool {
    first;
    last;

    constructor() {
        this.first = null;
        this.last = null;
    }

    /**
     * Get an update instruction from the pool or create one if the pool is empty
     */
    getInstruction(type, node, parent = null) {
        var ins = this.first;
        if (ins) {
            // remove and return the first instruction from the pool
            if (this.last === ins) {
                // last instruction
                this.first = this.last = null;
            } else {
                this.first = ins.next;
            }
            ins.type = type;
            ins.node = node;
            ins.parent = parent;
            ins.next = ins.deletedRefNodes = null;
            return ins;
        } else {
            return {
                type: type,
                node: node,
                parent: parent,
                next: null,
                deletedRefNodes: null
            };
        }
    }

    /**
     * Add a list of instruction to the pool (instructions are managed as linked list)
     * The previous owner of the list should release references to it once released to the pool
     * Note: the method assumes that the list is properly linked as only first and last elements are checked
     * @param listFirst {IvInstruction} the first element of the list
     * @param listLast {IvInstruction} the last element of the list
     */
    addInstructionList(listFirst, listLast) {
        if (listFirst && listLast) {
            if (this.last) {
                // current pool is not empty
                this.last.next = listFirst;
                this.last = listLast;
            } else {
                // current pool is empty
                this.first = listFirst;
                this.last = listLast;
            }

            listLast.next = null;
        }
    }

}

export const INSTRUCTIONS = {
    "CREATE_GROUP": 1,
    "DELETE_GROUP": 2,
    "REPLACE_GROUP": 3,
    "UPDATE_GROUP": 4,
    "UPDATE_ELEMENT": 5,
    "UPDATE_TEXT": 6
};

var TYPES = [];
TYPES[INSTRUCTIONS.CREATE_GROUP] = "CREATE_GROUP";       // requires parent + node ref (node index will give the position)
TYPES[INSTRUCTIONS.DELETE_GROUP] = "DELETE_GROUP";       // requires group ref only
TYPES[INSTRUCTIONS.REPLACE_GROUP] = "REPLACE_GROUP";     // requires group ref only
TYPES[INSTRUCTIONS.UPDATE_GROUP] = "UPDATE_GROUP";       // requires group ref only
TYPES[INSTRUCTIONS.UPDATE_ELEMENT] = "UPDATE_ELEMENT";   // requires element ref only
TYPES[INSTRUCTIONS.UPDATE_TEXT] = "UPDATE_TEXT";         // requires element ref only

export class IvInstructionSet {
    changes;        // linked list

    constructor() {
        this.changes = null;
    }

    setChanges(changes) {
        this.changes = changes;
    }

    /**
     * Return a concise, human-readable version of the change list
     * @param options {Object} options.indent specifies the string to be prepended to each line (empty string by default)
     * @returns {string}
     */
    toString(options = {indent: ""}) {
        var lines = [], instr, misc;

        instr = this.changes;
        while (instr) {
            misc = [];
            if (instr.parent) {
                misc.push(" in " + instr.parent.ref);
            }
            lines.push([options.indent, TYPES[instr.type], ": ", instr.node.ref, misc.join("")].join(""));
            instr = instr.next;
        }
        return lines.join("\n");
    }
}