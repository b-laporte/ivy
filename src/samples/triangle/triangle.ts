import { VdRenderer, $component, $refresh } from "../../iv";
import { htmlRenderer } from "../../htmlrenderer";

let r;
window["triangles"] = {
    renderer: null,
    init: function (div) {
        r = htmlRenderer(div, main);
    },
    refresh: function (elapsed) {
        if (r) {
            let seconds = Math.floor(elapsed / 1000) % 10 + 1
            r.refresh({ seconds: seconds, elapsed: elapsed });
        }
    }
}

let triangle = $component(class {
    props: { x: number, y: number, size: number, seconds: number }
    lastSeconds = -1;

    shouldUpdate() {
        // only update on seconds change
        return (this.lastSeconds !== this.props.seconds);
    }

    render(r: VdRenderer) {
        `---
        % let p = this.props, x=p.x, y=p.y, size=p.size, seconds=this.lastSeconds=p.seconds;
        % if (size<=25) {
            <c:dot x=x-12.5 y=y-12.5 size=25 [text]=seconds/>
        % } else {
            % let childSz = size/2, half = childSz/2;
            <c:triangle x=x y=y-half size=childSz [seconds]=seconds/>
            <c:triangle x=x-childSz y=y+half size=childSz [seconds]=seconds/>
            <c:triangle x=x+childSz y=y+half size=childSz [seconds]=seconds/>
        % }
        ---`
    }
});

let dot = $component(class {
    props: { x: number, y: number, size: number, text: string }
    lastText = "";
    hoverMode = false;

    shouldUpdate() {
        // only update on text change
        return (this.lastText !== this.props.text);
    }

    render(r: VdRenderer) {
        `---
        % let p = this.props;
        % this.lastText = p.text;
        <div [attr:style]=this.getStyle() onmouseenter()=this.hover() onmouseleave()=this.unhover()>
            % if (this.hoverMode) {
                **{{p.text}}**
            % } else {
                {{p.text}}
            % }
        </div>
        ---`
    }

    getStyle() {
        let p = this.props, sz = 1.3 * p.size;
        return `position:absolute;font:normal 15px sans-serif;text-align:center;cursor:pointer;\
            width:${sz}px;height:${sz}px;left:${p.x}px;top:${p.y}px;border-radius:${sz / 2}px;line-height:${sz}px;\
            background:${this.hoverMode ? "#ff0" : "#61dafb"}`;
    }

    hover() {
        this.hoverMode = true;
        $refresh(this);
    }

    unhover() {
        this.hoverMode = false;
        $refresh(this);
    }
});

function main(r: VdRenderer, seconds, elapsed) {
    `---
    This page demonstrates 3 types of parallel updates:
    <ul>
        <li> a general scale transformation applied on the main triangle every animation frame</li>
        <li> text node updates every second (the number in the blue dots) </li>
        <li> text node update on user input (you need to hover one of the blue dots) </li>
    </ul>
    <i> code derived from the <a href="https://stencil-fiber-demo.firebaseapp.com">stencil fiber demo</a></i>
    
    <div id="main" [attr:style]=computeMainStyle(elapsed)>
        <c:triangle x=0 y=0 size=1e3 [seconds]=seconds/>
    </div>
     ---`
}

function computeMainStyle(elapsed) {
    let t = elapsed / 1e3 % 10;
    return `position:absolute;transform-original:0 0;left:50%;top:50%;width:10px;height:10px;\
    background:#eee;transform:scaleX(${(1 + (t > 5 ? 10 - t : t) / 10) / 2.1}) scaleY(0.7) translateZ(0.1px)`;
}
