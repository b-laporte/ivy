
import { $component, $refresh, $initProps, $eventSink } from "../../iv";
import { VdGroupNode } from "../../vdom";

export function helloWorld() {`
    Hello !
`}

export function hello(name, className) {`
    <h1 [className]=className> Hello {{name}} </h1>
`}

export function hello2(name, className) {`
    // variant with class attribute
    <h1 [a:class]=className> Hello {{name}} (!) </h1>
`}

export function hello3(name, className, className2) {`
    // propertie and attibute values are JS expressions
    <h1 [a:class]=className> 
        Hello <span a:class=(className2 + " yellowBkg")> {{name}} </span> (!) 
    </h1>
`}

export function hello4(name, className, className2) {`
    // JS code and local variables can be inserted
    % let cls = className2 || "highlight";
    <h1 [a:class]=className> 
        Hello <span a:class=(cls + " yellowBkg")> {{name}} </span> (!) 
    </h1>
`}

export function hello5(nameOrMsg, className, className2) {`
    % let cls = (className2 || "highlight") + " yellowBkg";
    <h1 [a:class]=className> 
        // all JS control flows can be used (... except switch!)
        % if (nameOrMsg && nameOrMsg.indexOf(" ") + 1) {
            <span a:class=cls> {{nameOrMsg}} </span>
        % } else if (nameOrMsg) {
            Hello <span a:class=cls> {{nameOrMsg}} </span> (!!) 
        % } else {
            [no message]
        % }
    </h1>
`}

export function hello6(names: string[], className: string, className2: string) {`
    % let cls = (className2 || "highlight") + " yellowBkg";
    <h1 [a:class]=className> 
        % for (let nameOrMsg of names) {
            % if (nameOrMsg && nameOrMsg.indexOf(" ") + 1) {
                <span a:class=cls> {{nameOrMsg}} </span>
            % } else if (nameOrMsg) {
                Hello <span a:class=cls> {{nameOrMsg}} </span>
            % }
        % }
    </h1>
`}

export function hello7(names: string[], className: string, className2: string) {`
    % let cls = (className2 || "highlight") + " yellowBkg";
    <h1 [a:class]=className> 
        % for (let nameOrMsg of names) {
            % if (nameOrMsg && nameOrMsg.indexOf(" ") + 1) {
                <c:msg [text]=nameOrMsg className=cls/>
            % } else if (nameOrMsg) {
                Hello <c:msg [text]=nameOrMsg className=cls/>
            % }
        % }
    </h1>
`}

function msg(text, className) {`
    <span [a:class]=className> {{text}} </span>
`}

export let btn = $component(class {
    count = 0;

    render() {
        `---
        <button a:class="btn btn-outline-primary" onclick()=this.update()> 
            {{this.count}} click{{this.count!==1? "s" : ""}} 
        </button>
         ---`
    }

    update() {
        this.count++;
        $refresh(this);
    }
});

export let btn2 = $component(class {
    props: {
        value: string;
        onclick: (e?:Event) => void;
    }
    
    init() {
        $initProps(this, {
            value: "",
            onclick: $eventSink
        });
    }

    render() {
        `---
        <button a:class="btn btn-outline-primary" onclick(e)=this.props.onclick(e)> 
            {{this.props.value}}
        </button>
         ---`
    }
});

export let button = $component(class {
    props: {
        value: string;
        $content: VdGroupNode;
        onclick: (e?:Event) => void;
    }
    
    init() {
        $initProps(this, {
            value: "",
            onclick: $eventSink
        });
    }

    render() {
        `---
        % let p = this.props, content = p.$content;
        <button a:class="btn btn-outline-primary" onclick(e)=p.onclick(e)> 
            % if (p.value) {
                {{p.value}}
            % } else {
                <ins:content/>
            % }
            
        </button>
         ---`
    }
});