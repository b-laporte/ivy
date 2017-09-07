import { VdRenderer } from "../../iv";
import { htmlRenderer } from "../../htmlrenderer";

window["showClock"] = function (elt) {
    let c = new Clock(elt);
}

class Clock {
    _iid;                   // interval id
    _renderer;              // html renderer
    hours:number;
    minutes:number;
    seconds:number;
    milliseconds:number;

    constructor(elt) {
        this._iid=setInterval(this.tick.bind(this),100);
        this._renderer = htmlRenderer(elt, clock);
        this.tick();
    }

    dispose() {
        clearInterval(this._iid);
    }

	tick() {
		var d=new Date();
		this.hours = d.getHours();
		this.minutes = d.getMinutes();
		this.seconds = d.getSeconds();
		this.milliseconds = d.getMilliseconds();
        this._renderer.refresh({c:this});
	}
};

function clock(r: VdRenderer, c) {
    `---
    // example from http://www.ractivejs.org/examples/clock/
    <div a:class="square">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(50,50)">
                <circle a:class="clock-face" r="48"/> // a attribute prefix not-mandatory in svg
                // minute markers
                % for (let i=0;60>i;i++) {
                    % let isMajorMarker = (i%5 === 0);
                    <line class=(isMajorMarker? "major" : "minor") 
                        y1=(isMajorMarker? 35 : 42) y2=45
                        transform=("rotate(" + (360 * i/60) + ")")/>
                % }
                // hour hand
                <c:hand kind="hour" [rotation]=(30*c.hours+c.minutes/2)/>
                <c:hand kind="minute" [rotation]=(6*c.minutes+c.seconds/10)/>
                <g [transform]=("rotate(" + 6 * (c.seconds + c.milliseconds*0.001) +")")>
                    <line class="second" y1="10" y2="-38"/>
                    <circle class="second-counterweight" transform="translate(0,8)" r="1"/>
                </g>
            </g>
        </svg>
    </div>
     ---`
}

function hand(r:VdRenderer, kind:string, rotation:number) {
    `---
        <line class=kind y1="2" y2=(kind==="minute"? "-25" : "-17") [transform]=("rotate(" + rotation + ")")/>
     ---`
}