import { XtmlFragment, createXtmlFragment, XtmlElement, addText, addElement, addComponent, addParamNode, XtmlParam, addParam, addDecorator, addLabel } from './xtml';

const CHAR_EOS = -1, // end of string
    CHAR_NL = 10,      // \n new line
    CHAR_SPACE = 32,   // space
    CHAR_DQUO = 34,    // "
    CHAR_HASH = 35,    // #
    CHAR_SQUO = 39,    // '
    CHAR_PARS = 40,    // (
    CHAR_PARE = 41,    // )
    CHAR_STAR = 42,    // *
    CHAR_PLUS = 43,    // +
    CHAR_MINUS = 45,   // -
    CHAR_DOT = 46,     // .
    CHAR_AT = 64,      // @
    CHAR_FSLA = 47,    // forward slash: /
    CHAR_BSLA = 92,    // back slash: \
    CHAR_SBRS = 91,    // [
    CHAR_SBRE = 93,    // ]
    CHAR_LT = 60,      // <
    CHAR_EQ = 61,      // =
    CHAR_GT = 62,      // >
    CHAR_CS = 123,     // {
    CHAR_CE = 125,     // }
    CHAR_n = 110,
    CHAR_t = 116,
    CHAR_r = 114,
    CHAR_u = 117,
    CHAR_e = 101,
    CHAR_f = 102,
    CHAR_a = 97,
    CHAR_l = 108,
    CHAR_s = 115,
    CHAR_NBSP = '\u00A0'.charCodeAt(0), // non breaking space
    RX_TRAILING_SPACES = /[ \t\r\f\n]+$/;

// parse generates an XtmlFragment (XTML tree)
export function parse(xtml: string): XtmlFragment {
    let xf = createXtmlFragment(),
        posEOS = xtml.length,
        pos = 0,    // current position
        cc: number = CHAR_EOS;   // current char code at current position
    if (posEOS > 0) {
        cc = xtml.charCodeAt(0);
        xtmlContent(xf);
        if (cc !== CHAR_EOS) {
            error();
        }
    }
    return xf;

    function moveNext() {
        pos++;
        return cc = pos < posEOS ? xtml.charCodeAt(pos) : CHAR_EOS;
    }

    function nextCharCode() {
        return pos + 1 < posEOS ? xtml.charCodeAt(pos + 1) : CHAR_EOS;
    }

    function eat(charCode: number, errMsg?: string) {
        if (cc !== charCode) {
            if (errMsg === undefined) {
                error(charName(charCode) + " expected instead of " + charName(cc));
            } else {
                error(errMsg);
            }
        }
        return moveNext();
    }

    function xtmlContent(parent: XtmlFragment | XtmlElement) {
        // parse xtml content: text or element
        let keepGoing = true;
        while (keepGoing) {
            if (!xtmlElement(parent) && !xtmlText(parent)) {
                keepGoing = false;
            }
        }
    }

    function xtmlText(parent: XtmlFragment | XtmlElement): boolean {
        // return true if blank spaces or text characters have been found
        if (cc === CHAR_LT || cc === CHAR_EOS) return false;
        let spacesFound = xtmlSpaces();
        if (cc !== CHAR_LT && cc !== CHAR_EOS) {
            let charCodes: number[] = [];
            if (spacesFound) {
                charCodes[0] = CHAR_SPACE; // leading spaces are transformed in a single space
            }
            while (cc !== CHAR_LT && cc !== CHAR_EOS) {
                // capture string
                if (cc === CHAR_BSLA) {
                    cc = eat(CHAR_BSLA); // \
                    if (cc === CHAR_SPACE) {
                        // transform into non-breaking space
                        charCodes.push(CHAR_NBSP);
                    } else if (cc == CHAR_n) {
                        // \n new line
                        charCodes.push(CHAR_NL);
                    }
                } else {
                    charCodes.push(cc);
                    moveNext();
                }
            }
            addText(parent, String.fromCharCode.apply(null, charCodes).replace(RX_TRAILING_SPACES, " "));
        }
        return true;
    }

    function xtmlSpaces(): boolean {
        // eat spaces (white spaces or carriage return, tabs, etc.) 
        // return true if spaces have been found
        if (cc === CHAR_EOS) return false;
        let startPos = pos;

        // CHAR_BACK = 8,   // \b backspace
        // CHAR_TAB = 9,    // \t tab
        // CHAR_NL = 10,    // \n new line
        // CHAR_VTAB = 11,  // \v vertical tab
        // CHAR_FEED = 12,  // \f form feed
        // CHAR_CR = 13,    // \r carriage return
        while (cc === CHAR_SPACE || (cc > 7 && cc < 14)) {
            // white spaces
            moveNext();
        }
        return pos !== startPos;
    }

    function xtmlElement(parent: XtmlFragment | XtmlElement): boolean {
        // return true if an XtmlElement has been found
        if (cc !== CHAR_LT || nextCharCode() === CHAR_FSLA) return false;
        cc = moveNext(); // eat <
        // prefix: [none] or * or . or @
        let prefix = 0;
        eatPrefix();
        let name = xtmlIdentifier(true, prefix === 0), elt = createElement();

        if (xtmlSpaces()) {
            // spaces have been found: parse params
            xtmlParams(elt, endParamReached);
        }
        if (cc === CHAR_FSLA) {
            // end of element
            eat(CHAR_FSLA); // /
            eat(CHAR_GT); // >
        } else if (cc === CHAR_GT) {
            eat(CHAR_GT); // >
            // parse element content
            xtmlContent(elt);
            // parse end of element
            eat(CHAR_LT); // <
            eat(CHAR_FSLA); // /
            let endPos = pos;
            let p1 = prefix, p2 = eatPrefix(), name2 = xtmlIdentifier(false);
            if (name2 !== "" || p2 !== 0) {
                // end tag name is provided
                if (p1 !== p2 || (name2 !== "" && name2 !== name)) {
                    pos = endPos; // to get a better error message
                    error('End tag </' + eltName(p2, name2) + '> doesn\'t match <' + eltName(p1, name) + '>');
                }
            }
            xtmlSpaces();
            eat(CHAR_GT); // >
        } else {
            error();
        }

        return true;

        function endParamReached() {
            return (cc === CHAR_FSLA || cc === CHAR_GT); // / or >
        }

        function eatPrefix() {
            if (cc === CHAR_STAR || cc === CHAR_DOT || cc === CHAR_AT) { // * . @
                prefix = cc;
                cc = moveNext(); // eat prefix
                return prefix;
            }
            return 0;
        }

        function createElement(): XtmlElement {
            if (prefix === CHAR_STAR) { // *
                return addComponent(parent, xf.ref(name));
            } else if (prefix === CHAR_DOT) { // .
                return addParamNode(parent, name);
            } else if (prefix === CHAR_AT) { // @
                // decorator node
                error("Decorator node are not supported yet");
            }
            return addElement(parent, name);
        }

        function eltName(prefix: number, nm: string) {
            return (prefix === 0 ? "" : String.fromCharCode(prefix)) + nm;
        }
    }

    function xtmlIdentifier(mandatory: boolean, acceptDashes = false): string {
        // identifier is used for references and component/decorators names (which area also references)
        // they cannot start with $ on the contrary to JS identifiers
        let charCodes: number[] = [];
        // first char cannot be a number
        if (ccIsChar()) {
            charCodes.push(cc);
            moveNext();
            while (ccIsChar() || ccIsNumber() || (acceptDashes && cc === CHAR_MINUS)) {
                charCodes.push(cc);
                moveNext();
            }
        } else if (mandatory) {
            error("Invalid XTML identifier");
        }
        if (charCodes.length === 0) return "";
        return String.fromCharCode.apply(null, charCodes);
    }

    function xtmlParams(parent: (XtmlElement | XtmlParam), endReached: () => boolean) {
        let prefix = 0, keepGoing = true;
        while (keepGoing && !endReached()) {
            // param name: prefix + name
            prefix = eatPrefix();
            let name = xtmlIdentifier(true, prefix === 0), isProperty = false;
            if (prefix === CHAR_SBRS) { // [
                eat(CHAR_SBRE); // ]
                isProperty = true;
            }

            let spacesFound = xtmlSpaces();
            if (cc === CHAR_EQ) {
                // look for value
                eat(CHAR_EQ);
                xtmlSpaces();
                registerParam(name, xtmlParamValue(), isProperty);
                if (!xtmlSpaces()) {
                    // no spaces found -> we have reached the end of the param list
                    keepGoing = false;
                }
            } else if (prefix === CHAR_AT && cc === CHAR_PARS) {
                let deco = registerParam(name);
                // look for attribute params for decorators
                eat(CHAR_PARS); // ( parens start
                xtmlSpaces();
                xtmlParams(deco, endDecoParamReached)
                eat(CHAR_PARE); // ) parens end

                if (!xtmlSpaces()) {
                    // no spaces found -> we have reached the end of the param list
                    keepGoing = false;
                }
            } else if (spacesFound) {
                // orphan attribute
                registerParam(name);
            } else {
                keepGoing = false;
            }
        }
        if (!endReached()) {
            error();
        }

        function endDecoParamReached() {
            return (cc === CHAR_PARE); // )
        }

        function registerParam(name: string, value?: any, isProperty: boolean = false) {
            if (prefix === CHAR_AT) {
                return addDecorator(parent, xf.ref(name), value);
            } else if (prefix === CHAR_HASH) {
                return addLabel(parent, name, value);
            }
            return addParam(parent, name, value, isProperty);
        }

        function eatPrefix(): number {
            // [ @ or #
            if (cc === CHAR_SBRS || cc === CHAR_AT || cc === CHAR_HASH) {
                let res = cc;
                moveNext();
                return res;
            }
            return 0;
        }
    }

    function xtmlParamValue() {
        // return the param value
        if (cc === CHAR_SQUO) {
            return stringContent(CHAR_SQUO); // single quote string
        } else if (cc === CHAR_DQUO) {
            return stringContent(CHAR_DQUO); // double quote string
        } else if (cc === CHAR_CS) { // {
            // reference
            eat(CHAR_CS);
            xtmlSpaces();
            let refName = xtmlIdentifier(true, false);
            xtmlSpaces();
            eat(CHAR_CE);
            return xf.ref(refName);
        } else if (cc === CHAR_t) {
            // true
            eat(CHAR_t); eat(CHAR_r); eat(CHAR_u); eat(CHAR_e);
            return true;
        } else if (cc === CHAR_f) {
            // false
            eat(CHAR_f); eat(CHAR_a); eat(CHAR_l); eat(CHAR_s); eat(CHAR_e);
            return false;
        } else if (ccIsNumber() || ccIsSign()) {
            // number: 123 or 12.34
            let charCodes: number[] = [];
            if (ccIsSign()) {
                charCodes.push(cc);
                moveNext();
                xtmlSpaces();
            }
            while (ccIsNumber()) {
                charCodes.push(cc);
                moveNext();
            }
            if (cc === CHAR_DOT) {
                charCodes.push(CHAR_DOT);
                moveNext();
                if (!ccIsNumber()) {
                    error("Invalid number");
                }
                while (ccIsNumber()) {
                    charCodes.push(cc);
                    moveNext();
                }
            }
            return parseFloat(String.fromCharCode.apply(null, charCodes));
        }
        error("Invalid parameter value: " + charName(cc));
        return 0;
    }

    function error(msg?: string) {
        let lines = xtml.split("\n"), lineLen = 0, posCount = 0, idx = 0, lineNbr = lines.length, columnNbr = lines[lineNbr - 1].length;
        if (pos > -1) {
            while (idx < lines.length) {
                lineLen = lines[idx].length;
                if (posCount + lineLen < pos) {
                    // continue
                    idx++;
                    posCount += lineLen + 1; // +1 for carriage return
                } else {
                    // stop
                    lineNbr = idx + 1;
                    columnNbr = 1 + pos - posCount;
                    break;
                }
            }
        }

        if (msg === undefined) {
            msg = "Invalid character: " + charName(cc);
        }
        throw "XTML: " + msg + "\nLine " + lineNbr + " / Col " + columnNbr + "\nExtract: >> " + lines[lineNbr - 1].trim() + " <<";
    }

    function charName(c: number) {
        if (c === CHAR_EOS) return "End of Content";
        return "'" + String.fromCharCode(c) + "'";
    }

    function stringContent(delimiter: number): string {
        let charCodes: number[] = [];
        eat(delimiter);
        while (cc !== delimiter && cc !== CHAR_EOS) {
            if (cc === CHAR_BSLA) { // \
                moveNext();
            }
            charCodes.push(cc);
            moveNext();
        }
        eat(delimiter);
        return String.fromCharCode.apply(null, charCodes);
    }

    function ccIsChar() {
        // a:97 z:122 A:65 Z:90
        return (cc > 96 && cc < 123) || (cc > 64 && cc < 91);
    }

    function ccIsNumber() {
        // 0:48 9:57
        return cc > 47 && cc < 58;
    }

    function ccIsSign() {
        return cc === CHAR_PLUS || cc === CHAR_MINUS;
    }
}