/**
 * Created by b-laporte on 02/04/16.
 * Copyright Bertrand Laporte 2016
 */

import {NacNode, NacNodeType, NacAttributeNature} from './nac';


let CHAR_GT = 62,               // >
    CHAR_SLASH = 47,            // /
    CHAR_BACKSLASH = 92,        // \
    CHAR_STAR = 42,             // *
    CHAR_LT = 60,               // <
    CHAR_PERCENT = 37,          // %
    CHAR_NEWLINE = 10,          // \n
    CHAR_CR = 13,               // carriage return
    CHAR_LF = 12,               // line feed
    CHAR_SPACE = 32,            // space
    CHAR_TAB = 9,               // tab
    CHAR_AT = 64,               // @
    CHAR_HASH = 35,             // #
    CHAR_DOLLAR = 36,           // $
    CHAR_COLON = 58,            // :
    CHAR_COMMA = 44,            // ,
    CHAR_EQUAL = 61,            // =
    CHAR_DOUBLEQUOTE = 34,      // "
    CHAR_SINGLEQUOTE = 39,      // '
    CHAR_PARENSTART = 40,       // (
    CHAR_PARENEND = 41,         // )
    CHAR_BRACKETSTART = 91,     // [
    CHAR_BRACKETEND = 93,       // ]
    CHAR_0 = 48,
    CHAR_9 = 57,
    CHAR_A = 65,
    CHAR_Z = 90,
    CHAR_a = 97,
    CHAR_z = 122,
    CHAR_CURLYSTART = 123,      // {
    CHAR_CURLYEND = 125,        // }
    CHAR_VALUE = Math.MAX_VALUE,// pseudo character code to identify value elements passed in the template string
    CHAR_EOF = -1;              // pseudo char to mark end of file

class Parser {
    strings;    // array of the string parts from the template string
    values;     // array of the values from the template string
    blockIdx;   // index of the current string being parsed
    charIdx;    // index of the next character to be parsed in the current block - can be equal to the block length
    block;      // reference to the current string being parsed
    blockLength;// length of the current block
    lineNbr;    // current line number
    colNbr;     // current column number
    value;      // current value or null if last char retrieved through moveNext() was not a value
    valueSymbol;// js reference to be used to get the value from a js expression (e.g. $v[42])
    currentCharCode;    // current char code, corresponds to the last char retrieved through moveNext. Set to null once processed
    currentChar;        // current char (equivalent to String.fromCharCode(this.currentCharCode)
    rootNode;           // root node or null
    currentNode;        // last Node created
    nodeStack;          // array of the last node for each level of the currentNode hierarchy
    targetNodeDepth;    // targeted depth
    jsBlockStack;       // current depth in js blocks

    constructor(strings, values) {
        this.strings = strings;
        this.values = values;
        this.lineNbr = 1;
        this.colNbr = 0;
        this.blockIdx = 0;
        this.block = strings[0];
        this.blockLength = this.block.length;
        this.charIdx = 0;
        this.currentCharCode = null;
        this.currentChar = "";
        this.value = null;
        this.valueSymbol = "";
        this.rootNode = null;
        this.currentNode = null;
        this.nodeStack = [];
        this.targetNodeDepth = 0;
        this.jsBlockStack = [];
    }

    /**
     * Return a state object which allows to come back in time if a parsing attempt fails
     * @see setState()
     * @return Array
     */
    getCurrentState() {
        return [
            "lineNbr", this.lineNbr,
            "colNbr", this.colNbr,
            "blockIdx", this.colIdx,
            "block", this.block,
            "charIdx", this.charIdx,
            "currentCharCode", this.currentCharCode,
            "currentChar", this.currentChar,
            "value", this.value,
            "valueSymbol", this.valueSymbol,
            "currentNode", this.currentNode,
            "targetNodeDepth", this.targetNodeDepth,
            "nodeStack", this.nodeStack.slice(0),
            "jsBlockStack", this.jsBlockStack.slice(0)
        ];
    }

    /**
     * Reinstate a previous state
     * @see getCurrentState
     * @param {Array} state - previously retrieved through getCurrentState()
     */
    setState(state) {
        for (let i = 0; state.length > i; i += 2) {
            this[state[i]] = state[i + 1];
        }
    }

    /**
     * Move currentCharCode to the next character in the template string
     * @returns Number the char code that has been found
     */
    moveNext() {
        if (this.currentCharCode !== null) {
            return this.currentCharCode;
        }
        let c;
        if (this.charIdx === this.blockLength) {
            // return EOF or EOB next value and move to next block
            if (this.blockIdx >= this.strings.length - 1 && this.blockIdx >= this.values.length) {
                // last block, no more value
                c = CHAR_EOF;
                this.colNbr++;
            } else {
                // mark end of block to capture it in parser grammar
                c = CHAR_VALUE;
                this.value = this.values[this.blockIdx];
                this.valueSymbol = "$v[" + this.blockIdx + "]"; // value represents the value symbol - e.g. $v[0]
                this.currentChar = "${" + this.value + "}"; // for error purposes
                this.blockIdx++;
                this.charIdx = 0;
                if (this.blockIdx < this.strings.length) {
                    this.block = this.strings[this.blockIdx];
                    this.blockLength = this.block.length;
                } else {
                    this.block = "";
                    this.blockLength = 0;
                }
                this.colNbr = -1; // cannot be calculated any more on this line
            }
        } else {
            c = this.block.charCodeAt(this.charIdx);
            this.charIdx++;
            if (this.colNbr > -1) {
                this.colNbr++;
            }
            if (c === CHAR_CR) {
                // transform CR / CRLF into new line chars
                if (this.nextCharCodeInBlock() === CHAR_LF) {
                    this.charIdx++;
                }
                c = CHAR_NEWLINE;
            }
            if (c === CHAR_NEWLINE) {
                this.lineNbr++;
                this.colNbr = 0;
            }
        }
        this.currentCharCode = c;
        if (c === CHAR_EOF) {
            this.currentChar = "EndOfTemplate";
        } else if (c !== CHAR_VALUE) {
            this.currentChar = String.fromCharCode(this.currentCharCode);
        }
    }

    /**
     * Move the parser cursor by many characters, as long as the okFunction returns true
     * @param buffer Array that will be filled with all matching character found
     * @param okFunction a function that will be called to validate each character. Signature is (charCode, charIdx)=>boolean
     * @returns {boolean} true if at least one character has been matched
     */
    advanceMany(buffer, okFunction) {
        let ok = true, hasMoved = false, i = 0;
        while (ok) {
            this.moveNext();
            if (this.currentCharCode === CHAR_EOF) {
                ok = false;
            } else {
                ok = okFunction(this.currentCharCode, i);
                if (ok === true) {
                    hasMoved = true;
                    buffer.push(this.currentChar);
                    this.currentCharCode = null;
                    i++;
                } else {
                    ok = false;
                }
            }
        }
        return hasMoved;
    }

    /**
     * Move the parser cursor to the next char. If the expected character is mandatory and not found, an error will be
     * automatically raised. If the character is not mandatory, the cursor will not be moved.
     * @param charCode the expected character code
     * @param mandatory true if the expected character is mandatory
     * @returns {boolean} true if the character has been found
     */
    advanceChar(charCode, mandatory) {
        this.moveNext();
        if (this.currentCharCode === charCode) {
            this.currentCharCode = null;
            return true;
        } else {
            if (mandatory) {
                if (this.currentCharCode === CHAR_EOF) {
                    throw "Unexpected end of package: " + String.fromCharCode(charCode) + " expected instead";
                } else {
                    if (this.currentCharCode === CHAR_NEWLINE) {
                        this.currentChar = "\\n";
                    }
                    throw "Unexpected '" + this.currentChar + "' was found instead of '"
                    + String.fromCharCode(charCode) + "'";
                }
            }
            return false;
        }
    }

    /**
     * Read and return the next character in the current block and ignores the current char.
     * Does not increment the charIdx cursor
     * @returns Number a char code or null if not found
     */
    nextCharCodeInBlock() {
        if (this.charIdx + 1 < this.blockLength) {
            return this.block.charCodeAt(this.charIdx + 1);
        }
        return null;
    }

    /**
     * Read and return the next character - can be the current char if 0 is passed as argument
     * @param shift the number of character to shift by - e.g. 0 for the current char in the pipe
     * @returns {*}
     */
    nextCharCode(shift) {
        if (this.currentCharCode !== null) {
            if (shift === 0) {
                return this.currentCharCode;
            } else {
                if (this.charIdx + shift - 1 < this.blockLength) {
                    return this.block.charCodeAt(this.charIdx + shift - 1);
                }
            }
        } else {
            if (this.charIdx + shift < this.blockLength) {
                return this.block.charCodeAt(this.charIdx + shift);
            }
        }
        return null;
    }

    /**
     * Add a node at the current position
     * @param nodeType the node type - cf. n in nac.js
     * @param nodeValue the node value - e.g. "some text" for nodeName="#text"
     * @param lineNbr the line number to use - will be the current line number by default
     */
    addNode(nodeType, nodeValue = null, lineNbr = -1) {
        let nd = new NacNode(nodeType, nodeValue);
        nd.lineNbr = (lineNbr > -1) ? lineNbr : this.lineNbr;
        if (!this.currentNode) {
            this.rootNode = this.currentNode = nd;
            this.nodeStack[0] = this.currentNode;
        } else {
            if (this.targetNodeDepth >= this.nodeStack.length) {
                // target node must be a child of the current node
                this.currentNode.c(nd);
                this.currentNode = nd;
                this.nodeStack.push(nd);
            } else if (this.targetNodeDepth === this.nodeStack.length - 1) {
                // target node is a sibling from the current node
                this.currentNode = this.currentNode.addSibling(nd);
                this.nodeStack[this.nodeStack.length - 1] = this.currentNode;
            } else {
                // target node is a parent from current node
                // we should not get there as syncCurrentNode() must have been called
                throw "Unexpected targetNodeDepth: " + this.targetNodeDepth + " vs. " + this.nodeStack.length;
            }
        }
        return this.currentNode;
    }

    /**
     * Increment or decrement the internal targetNodeDepth property that tells at which level current nodes should
     * be created
     * @param incr the increment - e.g. +1 or -1
     */
    shiftNodeDepth(incr) {
        this.targetNodeDepth += incr;
        if (incr < 0) {
            if (this.targetNodeDepth < this.nodeStack.length - 1) {
                this.currentNode = this.nodeStack[this.targetNodeDepth];
                this.nodeStack.splice(this.targetNodeDepth + 1);
            }
        }
    }
}

/**
 * Generate a list of NAC nodes out of a template string
 * Will receive arguments in the same manner as a template string tagging function
 * cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 * Note: this is a basic parser, more complex parsing could be implemented to support non BMP chars
 * cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt
 * @param strings array of the string parts from the template string
 * @param values array of the values from the template string
 * @return Object with 2 properties: "nac" for the root nac node (can be null), and "error" for the list of error
 * (can be null as well)
 */
export function parse(strings, values) {
    let p = new Parser(strings, values), root = null, error = null;

    try {
        let keepGoing = true;
        while (keepGoing) {
            if (!node(p) && !jsComment(p) && !jsNode(p) && (spaces(p).length === 0)) {
                // nothing more can be found
                keepGoing = false;
            }
        }
        if (p.currentCharCode !== CHAR_EOF) {
            //noinspection ExceptionCaughtLocallyJS
            throw "Invalid root-level character: '" + p.currentChar + "'";
        }
        root = p.rootNode;
    } catch (e) {
        let d = e.description || e;
        error = {description: d, line: p.lineNbr, column: p.colNbr};
        root = null;
    }

    return {nac: root, error: error};
}

/**
 * Parse an optional series of space characters
 * @param p the current parser
 * @returns {string} the spaces that have been parsed or an empty string
 */
function spaces(p) {
    let b = [];
    if (p.advanceMany(b, (c) => c === CHAR_SPACE || c === CHAR_NEWLINE || c === CHAR_TAB)) {
        return b.join('');
    }
    return "";
}


/**
 * Parse a text node and trim start and end spaces to one single white space
 * @param p
 * @return {boolean} true if a text node has been found
 */
function textNode(p) {
    let b = [], keepGoing = true, ccc = null, ln = p.lineNbr;
    while (keepGoing) {
        p.advanceMany(b, (c) => (c !== CHAR_LT && c !== CHAR_CURLYSTART && c !== CHAR_BACKSLASH && c !== CHAR_PERCENT && c !== CHAR_SLASH && c !== CHAR_VALUE));
        ccc = p.currentCharCode;
        if (ccc === CHAR_BACKSLASH) {
            // eat next 2 chars and keep going
            p.currentCharCode = null;
            p.moveNext();
            if (p.currentCharCode !== CHAR_EOF) {
                b.push(p.currentChar);
                p.currentCharCode = null;
            } else {
                keepGoing = false;
            }
        } else if (ccc === CHAR_CURLYSTART) {
            // check next char to see if this is the start of an insert node
            if (p.nextCharCode(1) === CHAR_CURLYSTART) {
                // beginning of an insert node
                keepGoing = false;
            } else {
                // eat the char
                b.push(p.currentChar);
                p.currentCharCode = null;
            }
        } else if (ccc === CHAR_SLASH) {
            // check if we start a comment node
            let next = p.nextCharCode(1);
            if (next === CHAR_SLASH || next === CHAR_STAR) {
                // beginning of a comment node
                keepGoing = false;
            } else {
                b.push(p.currentChar);
                p.currentCharCode = null;
            }
        } else if (ccc === CHAR_VALUE) {
            b.push(p.value);
            p.currentCharCode = null;
            p.moveNext();
        } else {
            // we found <
            keepGoing = false;
        }
    }

    if (b.length) {
        let s = b.join('').replace(/(^\s+)|(\s+$)/ig, " ");
        if (!s.match(/^\s+$/)) {
            // ignore white spaces only
            p.addNode(NacNodeType.TEXT, s, ln);
        }
        return true;
    }
    return false;
}

/**
 * Parse a full node e.g. <foo title="bar>Some text</foo>
 * @param p the current parser
 * @return boolean true if a node has been parsed
 */
function node(p) {
    p.moveNext();
    if (p.currentCharCode !== CHAR_LT || p.nextCharCode(1) === CHAR_SLASH) {
        return false; // this is not a node start but an end node
    }
    let ns = nodeStart(p);
    let initialJsStackDepth = p.jsBlockStack.length;
    if (!ns.closed) {
        p.shiftNodeDepth(1);
        nodeContent(p);
        let cn = p.colNbr;
        let nm = nodeEnd(p);
        if (nm.name !== ns.node.nodeName) {
            if (cn > -1) {
                p.colNbr = cn + 2; // to have a better error message
            }
            throw "End element '" + nm.name + "' doesn't match start element name";
        } else if (nm.prefix !== undefined || ns.prefix !== undefined) {
            if (nm.prefix !== ns.node.nodeNameSpace) {
                throw "End element namespace '" + nm.prefix + "' doesn't match start element namespace";
            }
        }
        if (initialJsStackDepth !== p.jsBlockStack.length) {
            if (cn > -1) {
                p.colNbr -= (nm.name.length + 2);
                if (nm.prefix !== undefined) {
                    p.colNbr -= (nm.prefix.length + 1);
                }
            }
            throw "End of '" + nm.name + "' node is incompatible with JS block structure";
        }
        p.shiftNodeDepth(-1);
    }
    return true;
}

/**
 * Parse the possible content of a node
 * @param p the current parser
 */
function nodeContent(p) {
    let keepGoing = true;
    while (keepGoing) {
        if (!node(p) && !jsNode(p) && !insertNode(p) && !jsComment(p) && !textNode(p)) {
            // nothing more can be found
            keepGoing = false;
        }
    }
}

/**
 * Parse a node start element - e.g. <foo id="bar">
 * @param p the current parser
 * @returns Object an object with a name and closed property
 */
function nodeStart(p) {
    let ns = {node: null, closed: false};
    p.advanceChar(CHAR_LT, true);
    spaces(p);
    let nd = p.addNode(NacNodeType.ELEMENT), nm = nodeName(p);
    nd.nodeName = nm.name;
    if (nm.prefix !== undefined) {
        nd.nodeNameSpace = nm.prefix;
    }
    ns.node = nd;
    ns.prefix = nm.prefix;
    spaces(p);
    nodeAttributes(p, nd);
    ns.closed = p.advanceChar(CHAR_SLASH, false);
    p.advanceChar(CHAR_GT, true);
    return ns;
}

/**
 * Parse the node attributes
 * @param p the current parser
 * @param nd the current node object
 */
function nodeAttributes(p, nd) {
    let keepGoing = true, att, attMap = {};
    while (keepGoing) {
        att = nodeAttributeName(p, attMap);
        if (!att) {
            keepGoing = false;
        } else {
            // look for potential attribute value
            nodeAttributeValue(p, att);
            spaces(p);

            // check that a value is provided when [], () or [[]] modifiers are used
            if (att.value === undefined && att.nature !== NacAttributeNature.STANDARD) {
                throw "Attribute value is mandatory for bound attributes and deferred expressions";
            }

            // add attribute to current node
            nd.addAttribute(att.name, att.value, att.nature, att.typeRef, att.parameters);
        }
    }

}

/**
 * Parse an attribute name - e.g. @foo or #bar or c:CptController or [[value:string]] or (onclick)
 * @param p the current parser
 * @param attMap an internal attribute map used to identify duplicate attributes
 * @returns {Object} an object representing the attribute - or null if no attribute name was found
 */
function nodeAttributeName(p, attMap) {
    let att = {
        name: "",            // name without # or @ prefix
        typeRef: "",        // type name specified after the : separator
        value: undefined,    // the attribute value if defined
        nature: NacAttributeNature.STANDARD // attribute nature - cf. NacAttributeNature
    }, isId = false, isAttNode = false, endChar1 = null, endChar2 = null;
    let b = [], colNbr0 = p.colNbr;

    if (p.advanceChar(CHAR_HASH, false)) {
        isId = true;
        b.push('"');
        att.name = "id";
    } else if (p.advanceChar(CHAR_AT, false)) {
        isAttNode = true;
        b.push('"');
        att.name = "@name";
    } else if (p.advanceChar(CHAR_VALUE, false)) {
        att.name = "@default";
        att.value = p.valueSymbol;
        p.currentCharCode = null;
        registerAttribute("@default", attMap);
        return att;
        // } else if (p.advanceChar(CHAR_PARENSTART, false)) {
        //     endChar1 = CHAR_PARENEND;
        //     att.nature = NacAttributeNature.DEFERRED_EXPRESSION;
    } else if (p.advanceChar(CHAR_BRACKETSTART, false)) {
        endChar1 = CHAR_BRACKETEND;
        if (p.advanceChar(CHAR_BRACKETSTART, false)) {
            endChar2 = CHAR_BRACKETEND;
            att.nature = NacAttributeNature.BOUND2WAYS
        } else {
            att.nature = NacAttributeNature.BOUND1WAY
        }
    }

    if (p.advanceMany(b, isJsIdentifierChar)) {
        if (isId || isAttNode) {
            b.push('"');
            att.value = b.join("");
        } else {
            att.name = b.join("");
        }
        registerAttribute(att.name, attMap);

        // look for type information
        if (p.advanceChar(CHAR_COLON, false)) {
            // parse the type name
            b = [];
            if (!p.advanceMany(b, isJsIdentifierChar)) {
                if (p.currentCharCode === CHAR_VALUE) {
                    att.typeRef = p.valueSymbol;
                    p.currentCharCode = null;
                } else {
                    throw "Attribute type cannot be empty";
                }
            } else {
                att.typeRef = b.join("");
            }
            // parse [] for arrays
            if (p.advanceChar(CHAR_BRACKETSTART, false)) {
                p.advanceChar(CHAR_BRACKETEND, true);
                att.typeRef += "[]";
            }
        } else if (p.advanceChar(CHAR_PARENSTART, false)) {
            // function attribute e.g. foo(event)=bar(event.value)
            spaces(p);
            nodeAttributeParameters(p, att);
            p.advanceChar(CHAR_PARENEND, true);
            if (att.nature === NacAttributeNature.BOUND1WAY || att.nature === NacAttributeNature.BOUND2WAYS) {
                p.colNbr = colNbr0; // set colNbr to original position for better error description
                throw "Function attributes cannot be bound";
            }
            att.nature = NacAttributeNature.DEFERRED_EXPRESSION;
        }

        if (endChar1) {
            p.advanceChar(endChar1, true);
            if (endChar2) {
                p.advanceChar(endChar2, true);
            }
        }

        return att;
    } else {
        if (isId || isAttNode || endChar1) {
            throw "Attribute name cannot be empty"
        }
    }
    return null;
}

function registerAttribute(name, attMap) {
    if (attMap[name]) {
        throw "Duplicate attribute: '" + name + "'";
    } else {
        attMap[name] = true;
    }
}

/**
 * Parse all different kinds of attribute values - e.g. "foo" or 'bar' or 42+53 or (x + y + (3+4) )
 * @param p
 * @param att
 * @returns {boolean}
 */
function nodeAttributeValue(p, att) {
    spaces(p);
    if (p.advanceChar(CHAR_EQUAL, false)) {
        spaces(p);
        if (!attValueWithQuotes(p, att) && !attValueAsBlock(p, att, true) && !attValueAsBlock(p, att, false)) {
            throw "Invalid attribute value";
        }
        if (att.nature === NacAttributeNature.DEFERRED_EXPRESSION) {
            // remove optional surrounding {} for function attributes
            att.value = att.value.replace(/(^\s*\{\s*)|(\s*}\s*$)/g, "");
        }
        return true;
    }
    return false;
}

/**
 * Parse the parameter names of a function attribute
 * @param p
 * @param att
 */
function nodeAttributeParameters(p, att) {
    let b, keepGoing = true;
    while (keepGoing) {
        b = [];
        spaces(p);
        if (p.advanceMany(b, isJsIdentifierChar)) {
            if (!att.parameters) {
                att.parameters = [];
            }
            att.parameters.push(b.join(""));
            spaces(p);
            keepGoing = p.advanceChar(CHAR_COMMA, false);
        } else {
            keepGoing = false;
        }
    }
}

/**
 * Parse an attribute value surrounded with single or double quotes
 * @param p
 * @param att
 * @returns {boolean} true if an attribute value has been found
 */
function attValueWithQuotes(p, att) {
    let boundaryCharCode = null, boundaryChar = "";
    if (p.advanceChar(CHAR_DOUBLEQUOTE, false)) {
        boundaryCharCode = CHAR_DOUBLEQUOTE;
        boundaryChar = '"';
    } else if (p.advanceChar(CHAR_SINGLEQUOTE, false)) {
        boundaryCharCode = CHAR_SINGLEQUOTE;
        boundaryChar = "'";
    } else {
        return false;
    }

    let b = [], keepGoing = true;
    b.push(boundaryChar);
    while (keepGoing) {
        p.advanceMany(b, (c) => (c !== boundaryCharCode && c !== CHAR_BACKSLASH && c !== CHAR_NEWLINE && c !== CHAR_VALUE));
        if (p.currentCharCode === CHAR_BACKSLASH) {
            // eat next 2 chars and keep going
            p.currentCharCode = null;
            p.moveNext();
            if (p.currentCharCode !== CHAR_EOF) {
                if (p.currentCharCode === CHAR_VALUE) {
                    b.push(p.valueSymbol);
                } else {
                    b.push(p.currentChar);
                }
                p.currentCharCode = null;
            } else {
                keepGoing = false;
            }
        } else if (p.currentCharCode === CHAR_VALUE) {
            b.push([boundaryChar, "+", p.valueSymbol, "+", boundaryChar].join(""));
            p.currentCharCode = null;
        } else {
            keepGoing = false;
        }
    }

    p.advanceChar(boundaryCharCode, true);
    b.push(boundaryChar);
    att.value = b.join("");

    return true;
}

/**
 * Parse an attribute value surrounded by parens - e.g. (123 + (a *b))
 * @param p the current parser
 * @param att the current attribute
 * @param useCurlyBrackets {boolean} true if curly brackets or parens (default) should be considered as block delimiters
 * @returns {boolean} true if an attribute value has been found
 */
function attValueAsBlock(p, att, useCurlyBrackets = false) {
    let b = [], keepGoing = true, parenCount = 0, col = p.colNbr, line = p.lineNbr,
        START = CHAR_PARENSTART, END = CHAR_PARENEND;

    if (useCurlyBrackets) {
        START = CHAR_CURLYSTART;
        END = CHAR_CURLYEND;
        // curly chars have to surround the full expression
        let found = p.advanceChar(START, false);
        if (found) {
            parenCount = 1;
        } else {
            return false;
        }
    }

    while (keepGoing) {

        p.advanceMany(b, (c) => {
            let parenOrNewlineOrValue = (c === START || c === END || c === CHAR_NEWLINE || c === CHAR_VALUE);
            //noinspection JSReferencingMutableVariableFromClosure
            if (parenCount > 0) {
                return !parenOrNewlineOrValue;
            } else {
                return !parenOrNewlineOrValue && c !== CHAR_SPACE && c !== CHAR_TAB && c !== CHAR_SLASH && c !== CHAR_GT;
            }
        });
        if (p.currentCharCode === START) {
            parenCount++;
            b.push(p.currentChar);
            p.currentCharCode = null;
            p.moveNext();
        } else if (p.currentCharCode === END) {
            parenCount--;
            b.push(p.currentChar);
            p.currentCharCode = null;
            p.moveNext();
            if (parenCount < 0) {
                if (p.colNbr > -1) {
                    p.colNbr -= 1; // to get a better error position
                }
                throw "Unexpected closing paren";
            }
        } else if (p.currentCharCode == CHAR_VALUE) {
            b.push(p.valueSymbol);
            p.currentCharCode = null;
        } else {
            if (parenCount > 0) {
                p.colNbr = col;
                p.lineNbr = line;
                throw "Missing closing paren in this expression";
            }
            keepGoing = false;
        }
    }
    if (b.length) {
        att.value = useCurlyBrackets ? "{" + b.join("") : b.join("");
        return true;
    }

    return false;
}

/**
 * Parse a node end element - e.g. </foo>
 * @param p
 * @returns {string}
 */
function nodeEnd(p) {
    p.advanceChar(CHAR_LT, true);
    p.advanceChar(CHAR_SLASH, true);
    let nm = nodeName(p);
    spaces(p);
    p.advanceChar(CHAR_GT, true);
    return nm;
}

/**
 * Parse an element name. Must be alpha char first, and alpha num then - e.g. div
 * @param p the current parser
 * @returns {} the node name structure (with name and prefix properties)
 */
function nodeName(p) {
    let b = [], hasEmptyNamespace = p.advanceChar(CHAR_COLON, false);

    if (!hasEmptyNamespace && !p.advanceMany(b, isJsIdentifierChar)) {
        throw "Invalid character in node name: '" + p.currentChar + "'";
    }
    if (hasEmptyNamespace || p.advanceChar(CHAR_COLON, false)) {
        let b2 = [];
        if (!p.advanceMany(b2, isJsIdentifierChar)) {
            throw "Invalid character in node name: '" + p.currentChar + "'";
        }
        return {prefix: b.join(""), name: b2.join("")};
    } else {
        return {name: b.join("")};
    }
}

/**
 * Parse a js expression or a js block - e.g. % let x = 3;
 * @param p the current parser
 * @returns {boolean} true if a jsNode has been found
 */
function jsNode(p) {
    p.moveNext();
    if (p.currentCharCode !== CHAR_PERCENT) {
        return false;
    }

    let line = p.lineNbr, col = p.colNbr, d = jsLine(p);
    if (d) {
        if (!d.isBlockStart && !d.isBlockEnd) {
            // simple instruction node
            p.addNode(NacNodeType.JS_EXPRESSION, d.expression);
        } else {
            let nd;
            if (d.isBlockEnd) {
                nd = p.jsBlockStack.pop();
                if (!nd) {
                    // set back line and col for a better error message
                    p.lineNbr = line;
                    p.colNbr = col;
                    throw "Unexpected end of JS block";
                }
                p.shiftNodeDepth(-1);
                if (!d.isBlockStart) {
                    nd.nodeValue.endBlockExpression = d.expression;
                } else {
                    let endBlockRxp = /^[^}]*};?/i;
                    nd.nodeValue.endBlockExpression = d.expression.match(endBlockRxp)[0];
                    // remove the current end block part and keep last part for the next block node
                    d.expression = d.expression.replace(endBlockRxp, "");
                }
            }
            if (d.isBlockStart) {
                nd = p.addNode(NacNodeType.JS_BLOCK, {
                    startBlockExpression: d.expression,
                    endBlockExpression: "}"
                });
                p.jsBlockStack.push(nd);
                p.shiftNodeDepth(1);
            }
        }
    }
    return true;
}

/**
 * Parse a JavaScript line and return data associated to it
 * @param p the current parser
 * @returns {Object} an object such as {isBlockStart:false, isBlockEnd:false, expression:"x=3;"} or null if empty
 */
function jsLine(p) {
    p.advanceChar(CHAR_PERCENT, true);

    let b = [], s, keepGoing = true;
    while (keepGoing) {
        p.advanceMany(b, (c) => c !== CHAR_NEWLINE && c !== CHAR_VALUE);
        if (p.currentCharCode === CHAR_VALUE) {
            b.push(p.valueSymbol);
            p.currentCharCode = null;
        } else {
            keepGoing = false;
        }
    }
    s = b.join("");
    if (!s.match(/^\s*$/)) {
        let data = {isBlockStart: false, isBlockEnd: false, expression: ""};
        // todo refactor parsing here
        data.isBlockStart = (s.match(/\{\s*$/) !== null);
        data.isBlockEnd = (s.match(/^[^}]*}/) !== null);
        // note: we should count opening/closing {} to support complex expressions in closing blocks
        data.expression = s;
        return data;
    }
    // eat next new line
    p.advanceChar(CHAR_NEWLINE, false);
    return null;
}

/**
 * Parse simple comments - e.g. // some comment
 * @param p the current parser
 * @returns {boolean} true if a comment done has been found
 */
function jsComment(p) {
    p.moveNext();
    if (p.currentCharCode !== CHAR_SLASH) {
        return false;
    }
    let nextChar = p.nextCharCode(1), isMultiLineComment = (nextChar === CHAR_STAR);
    if (!isMultiLineComment && nextChar !== CHAR_SLASH) {
        return false;
    }

    p.advanceChar(CHAR_SLASH, true);
    p.advanceChar(isMultiLineComment ? CHAR_STAR : CHAR_SLASH, true);

    let b = [], keepGoing = true;
    if (isMultiLineComment) {
        while (keepGoing) {
            p.advanceMany(b, (c) => (c !== CHAR_STAR && c !== CHAR_VALUE));
            if (p.currentCharCode === CHAR_VALUE) {
                b.push(p.value);
                p.currentCharCode = null;
            } else {
                // star char, check next
                if (p.nextCharCode(1) === CHAR_SLASH) {
                    keepGoing = false;
                } else {
                    b.push("*");
                    p.advanceChar(CHAR_STAR, true);
                }
            }
        }
        // eat closing sequence "*/
        p.advanceChar(CHAR_STAR, true);
        p.advanceChar(CHAR_SLASH, true);
    } else {
        while (keepGoing) {
            p.advanceMany(b, (c) => (c !== CHAR_NEWLINE && c !== CHAR_VALUE));
            if (p.currentCharCode === CHAR_VALUE) {
                b.push(p.value);
                p.currentCharCode = null;
            } else {
                keepGoing = false;
            }
        }

    }

    let s = b.join("");
    if (!s.match(/^\s*$/)) {
        // empty comments are ignored
        p.addNode(isMultiLineComment ? NacNodeType.COMMENT_ML : NacNodeType.COMMENT, s);

    }
    // eat next new line, if any
    p.advanceChar(CHAR_NEWLINE, false);
    return true;
}

/**
 * Parse insert nodes - e.g. {{someref.someValue + 42}}
 * @param p the current parser
 * @returns {boolean} true if an insert node has been found
 */
function insertNode(p) {
    if (p.nextCharCode(0) !== CHAR_CURLYSTART || p.nextCharCode(1) !== CHAR_CURLYSTART) {
        return false; // this is not a {{ sequence
    }
    p.advanceChar(CHAR_CURLYSTART, true);
    p.advanceChar(CHAR_CURLYSTART, true);

    let keepGoing = true, b = [];
    while (keepGoing) {
        p.advanceMany(b, (c) => (c !== CHAR_CURLYEND && c !== CHAR_VALUE));

        if (p.currentCharCode === CHAR_VALUE) {
            b.push(p.valueSymbol);
            p.currentCharCode = null;
        } else {
            p.advanceChar(CHAR_CURLYEND, true);
            if (p.advanceChar(CHAR_CURLYEND, false)) {
                // this is the end of the insert
                keepGoing = false;
            } else {
                // this is not the end
                b.push("}"); // push the last curly bracket and continue
            }
        }
    }

    if (b.length) {
        let s = b.join("");
        if (!s.match(/^\s*$/)) {
            // ignore empty expressions
            p.addNode(NacNodeType.INSERT, b.join(""));
        }
    }
    return true;
}

/**
 * Tell if a character is alphabetic: a-z or A-Z
 * @param charCode
 * @returns {boolean}
 */
function isAlpha(charCode) {
    return (charCode >= CHAR_a && charCode <= CHAR_z) || (charCode >= CHAR_A && charCode <= CHAR_Z);
}

/**
 * Tell if a character is a digit: 0-9
 * @param charCode
 * @returns {boolean}
 */
function isDigit(charCode) {
    return charCode >= CHAR_0 && charCode <= CHAR_9;
}

/**
 * Tell if a character is valid for a js identifier
 * @param c the character code
 * @param idx the position (first is 0)
 * @returns {boolean} true if the character is valid
 */
function isJsIdentifierChar(c, idx) {
    if (idx === 0) {
        return c === CHAR_DOLLAR || isAlpha(c);
    } else {
        return isAlpha(c) || isDigit(c);
    }
}