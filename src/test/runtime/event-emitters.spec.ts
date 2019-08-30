import * as assert from 'assert';
import { ElementNode, reset, getTemplate, stringify, logNodes, testData } from '../utils';
import { IvEventEmitter, IvEvent, IvCancelableEventEmitter } from '../../iv/events';
import { template, API, Controller } from '../../iv';
import { hasProperty, Data } from '../../trax/trax';

describe('Event emitters', () => {
    let body: ElementNode, eventLog: string[];

    beforeEach(() => {
        body = reset();
        eventLog = [];
    });

    function trackEvent(e: IvEvent, cancel = false) {
        let t = "";
        if (e.target && hasProperty(e.target, "name")) {
            t = 'target.name:' + e.target["name"];
        } else if (e.target && hasProperty(e.target, "title")) {
            t = 'target.title:' + e.target["title"];
        } else {
            t = 'target:' + e.target;
        }
        eventLog.push(`${e.type} ${t} data:${e.data} cancelable:${e.cancelable} cancelled:${e.defaultPrevented} ips:${e.immediatePropagationStopped}`)
        if (cancel) {
            e.preventDefault();
        }
    }

    function trackCall(name: string) {
        eventLog.push(`call: ${name}`);
    }

    it("should work for one listener", function () {
        let ee = new IvEventEmitter(), ok = true;
        ee.init("click", "T");

        assert.equal(ee.listenerCount, 0, "1");
        let l1 = ee.addListener(e => trackEvent(e));

        ok = ee.emit(); // no data

        assert.equal(ok, true, "2");
        assert.deepEqual(eventLog, [
            "click target:T data:null cancelable:false cancelled:false ips:false"
        ], "3");
        assert.equal(ee.listenerCount, 1, "4");

        ok = ee.emit("D");

        assert.equal(ok, true, "5");
        assert.deepEqual(eventLog, [
            "click target:T data:null cancelable:false cancelled:false ips:false",
            "click target:T data:D cancelable:false cancelled:false ips:false"
        ], "6");
        assert.equal(ee.listenerCount, 1, "7");

        ee.removeListener(l1);
        assert.equal(ee.listenerCount, 0, "8");
        eventLog = [];

        ok = ee.emit("D2");
        assert.equal(ok, true, "9");
        assert.deepEqual(eventLog, [], "10");
    });

    it("should work for multiple listeners", function () {
        let ee = new IvEventEmitter(), ok = true;
        ee.init("click", "T");

        let l1 = ee.addListener(e => trackEvent(e)), l2 = ee.addListener(() => trackCall("2"));

        ok = ee.emit(); // no data

        assert.equal(ok, true, "1");
        assert.deepEqual(eventLog, [
            "click target:T data:null cancelable:false cancelled:false ips:false",
            "call: 2"
        ], "2");
        assert.equal(ee.listenerCount, 2, "3");

        let l3 = ee.addListener(() => trackCall("3"));

        ok = ee.emit("D1");

        assert.equal(ok, true, "4");
        assert.deepEqual(eventLog, [
            "click target:T data:null cancelable:false cancelled:false ips:false",
            "call: 2",
            "click target:T data:D1 cancelable:false cancelled:false ips:false",
            "call: 2",
            "call: 3"
        ], "5");
        assert.equal(ee.listenerCount, 3, "6");

        ee.removeListener(l2);

        ok = ee.emit("D2");

        assert.equal(ok, true, "7");
        assert.deepEqual(eventLog, [
            "click target:T data:null cancelable:false cancelled:false ips:false",
            "call: 2",
            "click target:T data:D1 cancelable:false cancelled:false ips:false",
            "call: 2",
            "call: 3",
            "click target:T data:D2 cancelable:false cancelled:false ips:false",
            "call: 3"
        ], "8");
        assert.equal(ee.listenerCount, 2, "9");

        ee.removeAllListeners();

        eventLog = [];
        ok = ee.emit("D3");

        assert.equal(ok, true, "10");
        assert.deepEqual(eventLog, [], "11");
        assert.equal(ee.listenerCount, 0, "12");
    });

    it("should support stopImmediatePropagation", function () {
        let ee = new IvEventEmitter(), ok = true;
        ee.init("click", "T");;

        ee.addListener(e => trackEvent(e));
        ee.addListener(e => e.stopImmediatePropagation());
        ee.addListener(e => trackEvent(e));

        ok = ee.emit("D1");

        assert.equal(ok, true, "1");
        assert.deepEqual(eventLog, [
            "click target:T data:D1 cancelable:false cancelled:false ips:false"
        ], "2");
        assert.equal(ee.listenerCount, 3, "3");
    });

    it("should ignore preventDefault if event is not cancelable", function () {
        let ee = new IvEventEmitter(), ok = true;
        ee.init("click", "T");

        ee.addListener(e => trackEvent(e));
        ee.addListener(e => e.preventDefault());
        ee.addListener(e => trackEvent(e));

        ok = ee.emit("D1");

        assert.equal(ok, true, "1");
        assert.deepEqual(eventLog, [
            "click target:T data:D1 cancelable:false cancelled:false ips:false",
            "click target:T data:D1 cancelable:false cancelled:false ips:false"
        ], "2");
        assert.equal(ee.listenerCount, 3, "3");
    });

    it("should support preventDefault on cancelable events", function () {
        let ee = new IvCancelableEventEmitter(), ok = true;
        ee.init("click", "T");

        ee.addListener(e => trackEvent(e));
        ee.addListener(e => e.preventDefault());
        ee.addListener(e => trackEvent(e));

        ok = ee.emit("D1");

        assert.equal(ok, false, "1");
        assert.deepEqual(eventLog, [
            "click target:T data:D1 cancelable:true cancelled:false ips:false",
            "click target:T data:D1 cancelable:true cancelled:true ips:false"
        ], "2");
        assert.equal(ee.listenerCount, 3, "3");
    });

    it("should be usable on component APIs (w/o controller)", function () {
        @API class HelloAPI {
            name: string = "";
            helloEmitter: IvEventEmitter;
            hiEmitter: IvCancelableEventEmitter;
        }
        const hello = template(`($api:HelloAPI) => {
            # Hello {$api.name} #
        }`);
        const test = template(`() => {
            <div @onclick={=>"click"}/>
            <*hello #hello 
                name="World" 
                @onhello={e=>trackEvent(e)}
                @onhi={e=>trackEvent(e, true)}
                @onhi={e=>trackEvent(e)} />
            <*hello #hello2 
                name="World2" 
                @onhello={e=>trackEvent(e)} />
        }`);

        let t = getTemplate(test, body).render();

        assert.deepEqual(eventLog, [], "1");
        let helloCpt = t.query("#hello") as HelloAPI,
            helloCpt2 = t.query("#hello2") as HelloAPI;

        assert.equal(helloCpt.helloEmitter.listenerCount, 1, "2");
        assert.equal(helloCpt.hiEmitter.listenerCount, 2, "3");

        let ok = helloCpt.helloEmitter.emit("ABC");

        assert.equal(ok, true, "4");
        assert.deepEqual(eventLog, [
            "hello target.name:World data:ABC cancelable:false cancelled:false ips:false"
        ], "5");

        ok = helloCpt2.helloEmitter.emit("ABC2");

        assert.equal(ok, true, "6");
        assert.deepEqual(eventLog, [
            "hello target.name:World data:ABC cancelable:false cancelled:false ips:false",
            "hello target.name:World2 data:ABC2 cancelable:false cancelled:false ips:false"
        ], "7");

        ok = helloCpt.hiEmitter.emit("HI THERE!");
        assert.equal(ok, false, "8"); // event is cancelable
        assert.deepEqual(eventLog, [
            "hello target.name:World data:ABC cancelable:false cancelled:false ips:false",
            "hello target.name:World2 data:ABC2 cancelable:false cancelled:false ips:false",
            "hi target.name:World data:HI THERE! cancelable:true cancelled:false ips:false",
            "hi target.name:World data:HI THERE! cancelable:true cancelled:true ips:false"
        ], "9");
    });

    it("should be usable on component APIs (w/ controller)", function () {
        @API class HelloAPI {
            name: string = "";
            helloEmitter: IvCancelableEventEmitter;
            hiEmitter: IvCancelableEventEmitter;
        }
        @Controller class HelloCtl {
            $api: HelloAPI;
        }
        const hello = template(`($ctl:HelloCtl) => {
            let api = $ctl.$api
            # Hello {api.name} #
        }`);
        const test = template(`() => {
            <div @onclick={=>"click"}/>
            <*hello #hello 
                name="World"
                @onhi={e=>trackEvent(e, true)}
                @onhello={e=>trackEvent(e)}
                @onhi={e=>trackEvent(e)} />
        }`);

        let t = getTemplate(test, body).render();

        assert.deepEqual(eventLog, [], "1");
        let helloCpt = t.query("#hello") as HelloAPI;

        assert.equal(helloCpt.helloEmitter.listenerCount, 1, "2");
        assert.equal(helloCpt.hiEmitter.listenerCount, 2, "3");

        let ok = helloCpt.helloEmitter.emit("ABC");

        assert.equal(ok, true, "4");
        assert.deepEqual(eventLog, [
            "hello target.name:World data:ABC cancelable:true cancelled:false ips:false"
        ], "5");

        ok = helloCpt.hiEmitter.emit("HI THERE!");
        assert.equal(ok, false, "5"); // event is cancelable
        assert.deepEqual(eventLog, [
            "hello target.name:World data:ABC cancelable:true cancelled:false ips:false",
            "hi target.name:World data:HI THERE! cancelable:true cancelled:false ips:false",
            "hi target.name:World data:HI THERE! cancelable:true cancelled:true ips:false"
        ], "6");
    });

    it("should be usable on param nodes", function () {
        @Data class HelloHeader {
            title: string;
            clickEmitter: IvEventEmitter;
        }
        @API class HelloAPI {
            name: string = "";
            header: HelloHeader;
            clickOnHeader: () => boolean;
        }
        @Controller class HelloCtl {
            $api: HelloAPI;
            $init() {
                this.$api.clickOnHeader = () => {
                    return this.$api.header.clickEmitter.emit("HEADER CLICKED");
                }
            }
        }
        const hello = template(`($ctl:HelloCtl) => {
            let api = $ctl.$api
            # Hello {api.name} #
        }`);
        const test = template(`() => {
            <*hello #hello name="World">
                <.header title={"Header"} @onclick={e=>trackEvent(e, true)} />
            </*hello>
        }`);

        let t = getTemplate(test, body).render();

        assert.deepEqual(eventLog, [], "1");
        let helloCpt = t.query("#hello") as HelloAPI;

        let ok = helloCpt.clickOnHeader();
        assert.equal(ok, true, "2"); // event is not cancelable
        assert.deepEqual(eventLog, [
            "click target.title:Header data:HEADER CLICKED cancelable:false cancelled:false ips:false"
        ], "3");
    });

});