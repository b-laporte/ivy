require('./index.html');    // webpack dependency
require('./styles.css');    // webpack dependency
import { template, Controller } from "../../iv";

@Controller class ClockCtl {
    iid: any; // interval id
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;

    $init() {
        this.iid = setInterval(this.tick.bind(this), 100);
        this.tick();
    }

    $dispose() {
        clearInterval(this.iid);
        this.iid = null;
    }

    tick() {
        var d = new Date();
        this.hours = d.getHours();
        this.minutes = d.getMinutes();
        this.seconds = d.getSeconds();
        this.milliseconds = d.getMilliseconds();
    }
};

const clock = template(`($:ClockCtl) => {
    // original example from Rich Harris at http://www.ractivejs.org/examples/clock/ 
    // (site no longer available)
    <svg class="clock" viewBox="0 0 100 100">
        <g transform="translate(50,50)">
            // dial
            <circle class="clock-face" r="48"/>
            // minute markers
            for (let i=0;60>i;i++) {
                let isMajorMarker = (i%5 === 0);
                <line class={isMajorMarker? "major" : "minor"} 
                    y1={isMajorMarker? 35 : 42} y2=45
                    transform={"rotate(" + (360 * i/60) + ")"}/>
            }
            // hours hand
            <*hand kind="hour" rotation={30*$.hours+$.minutes/2}/>
            // minutes hand
            <*hand kind="minute" rotation={6*$.minutes+$.seconds/10}/>
            // seconds hand
            <g transform={"rotate(" + 6 * ($.seconds + $.milliseconds*0.001) +")"}>
                <line class="second" y1="10" y2="-38"/>
                <circle class="second-counterweight" transform="translate(0,8)" r="1"/>
            </g>
        </g>
    </svg>
}`);

const hand = template(`(kind: string, rotation: number) => {
    <line class={kind} 
        y1="2" 
        y2={kind==="minute"? "-25" : "-17"} 
        transform={"rotate(" + rotation + ")"}
    />
}`);

// main display
let tpl = clock().attach(document.getElementById("main")).render();