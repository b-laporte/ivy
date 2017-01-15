/**
 * IV error tests
 * Copyright Bertrand Laporte 2016
 * Created on 28/04/16.
 */

/* global describe, it, beforeEach, afterEach, expect */

import {iv} from '../src/iv/iv';

describe('IV errors', () => {
    let originalLog = iv.log, lastError = null;

    function errLog(err) {
        lastError = err.description();
    }

    beforeEach(() => {
        iv.log = errLog;
        lastError = null;
    });

    afterEach(() => {
        iv.log = originalLog;
    });

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
        expect(lastError).toBe("[:title@line:4] Type description not found");
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
        expect(lastError).toBe("[:title@line:5] Type mismatch");
    });

    it('should be raised when a data node is used in an element', () => {
        let pkg = iv`
            <function #test>
                <div>
                    Hello
                    <:title> Hello </:title>
                </div>
            </function>
        `;
        pkg.test.createView();
        expect(lastError).toBe("[:title@line:5] Invalid data node context");
    });

    it('should be raised when an invalid component reference is used', () => {
        let pkg = iv`
            <type #foo bar:String/>
            
            <function #test>
                <div>
                    Hello
                    <foo> Bar </foo>
                </div>
            </function>
        `;
        pkg.test.createView();
        expect(lastError).toBe("[foo@line:7] Invalid function reference");
    });

    it('should support line and file context information', () => {
        // error at parser level
        let pkg1 = iv`
          // @line:89 @file:errors.spec
          <hello>
        `;

        expect(lastError).toBe("[errors.spec,line:91] Unexpected end of package: < expected instead");

        // error at compilation / package level
        let pkg2 = iv`
          // @line:97 @file:errors.spec
          
          <function #foo>
            <div> hello </div>
          </function>
          
          <blah/>
          
          <type #bar foo:String/>
        `;

        expect(lastError).toBe("[blah@errors.spec,line:103] Invalid node: blah");

        // error at compilation / function level
        let pkg3 = iv`
          // @line:112 @file:errors.spec
          
          <function #foo>
            <div #zoo> hello </div>
            <span #zoo> world </span>
          </function>
          
          <blah/>
          
          <type #bar foo:String/>
        `;

        expect(lastError).toBe("[span@errors.spec,line:116] Same id cannot be used twice in the same function context");

        // runtime error
        let pkg4 = iv`
          // @line:128 @file:errors.spec
          
          <function #foo>
            <div> <:head> hello </:head> </div>
          </function>
          
          <type #bar foo:String/>
        `;

        pkg4.foo.createView();
        expect(lastError).toBe("[:head@errors.spec,line:131] Invalid data node context");
    });

    it('should raise compilation error for invalid script blocks', () => {
        let pkg1 = iv`
          % if (foo) {
              <function #foo>
                
              </function>
          % }
        `;
        expect(lastError).toBe("[line:2] Unauthorized JavaScript block");

        let pkg2 = iv`
          // @line:152
          % if (foo) {
          <function #foo>
            
          </function>
          
        `;
        expect(lastError).toBe("[line:153] Unauthorized JavaScript block");
    });

    it('should raise compilation error for missing function ids', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:164
          <function #foo>
          </function>
          
          <function bar title:String>
          </function>
        `;
        expect(lastError).toBe("[function@errors.spec,line:168] Missing function id");
    });

    it('should raise compilation error for missing type ids', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:176
          <function #foo>
          </function>
          
          <type bar title:String/>
        `;
        expect(lastError).toBe("[type@errors.spec,line:180] Missing type id");
    });

    it('should raise compilation error for empty type definition', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:187
          <type #foo/>
        `;
        expect(lastError).toBe("[type@errors.spec,line:188] Empty type definition");
    });

    it('should raise compilation error for bound attributes used on type or function definitions', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:195
          <type #foo [title:String]="A"/>
        `;
        expect(lastError).toBe("[type@errors.spec,line:196] Bound attributes cannot be used on type definitions");

        let pkg2 = iv`
          // @file:errors.spec @line:201
          <function #foo [title:String]="A">
          </function>
        `;
        expect(lastError).toBe("[function@errors.spec,line:202] Bound attributes cannot be used on function definitions");

        let pkg3 = iv`
          // @file:errors.spec @line:208
          <function #foo [[title:String]]="A">
          </function>
        `;
        expect(lastError).toBe("[function@errors.spec,line:209] Bound attributes cannot be used on function definitions");
    });

    it('should raise compilation error for deferred expressions on type or function definitions', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:217
          <type #foo onclick()=123/>
        `;
        expect(lastError).toBe("[type@errors.spec,line:218] Deferred expressions cannot be used on type definitions");

        let pkg2 = iv`
          // @file:errors.spec @line:223
          <function #foo onclick()=doThis()>
          </function>
        `;
        expect(lastError).toBe("[function@errors.spec,line:224] Deferred expressions cannot be used on function definitions");
    });

    it('should raise compilation error for definitions containing attributes with the same name', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:232
          <type #foo bar:String title:String bar:Number/>
        `;
        expect(lastError).toBe("[errors.spec,line:233] Duplicate attribute: 'bar'");

        let pkg2 = iv`
          // @file:errors.spec @line:238
          <function #foo title:String title="Hello">
          </function>
        `;
        expect(lastError).toBe("[errors.spec,line:239] Duplicate attribute: 'title'");
    });

    it('should raise compilation error for type definitions containing default values', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:247
          <type #foo bar:String baz:Number=123/>
        `;
        expect(lastError).toBe("[type@errors.spec,line:248] Type definition cannot contain default values");
    });

    it('should raise compilation error for definitions containing attributes and list items with the same name', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:255
          <type #foo bar:String title:String barList:String[]/>
        `;
        expect(lastError).toBe("[type@errors.spec,line:256] Duplicate attribute and list item names: 'bar'");

        let pkg2 = iv`
          // @file:errors.spec @line:261
          <function #foo title:String titleList:String[]>
          </function>
        `;
        expect(lastError).toBe("[function@errors.spec,line:262] Duplicate attribute and list item names: 'title'");
    });

    it('should raise compilation error for invalid list types', () => {
        let pkg1 = iv`
          // @file:errors.spec @line:270
          <type #foo bar:String bazList:Number/>
        `;
        expect(lastError).toBe("[type@errors.spec,line:271] bazList type must end with '[]'");
    });
});
