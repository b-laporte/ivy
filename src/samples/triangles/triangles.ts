require('./index.html'); // webpack dependency
import { template } from "../../iv";

const triangle = template(`(x: number, y: number, size: number, seconds: number) => {
    if (size<=25) {
        <*dot x={x-12.5} y={y-12.5} size=25 text={seconds}/>
    } else {
        let childSz = size/2, half = childSz/2;
        <*triangle x={x} y={y-half} size={childSz} seconds={seconds}/>
        <*triangle x={x-childSz} y={y+half} size={childSz} seconds={seconds}/>
        <*triangle x={x+childSz} y={y+half} size={childSz} seconds={seconds}/>
    }
}`);

const dot = template(`(x: number, y: number, size: number, text: string, hover:boolean, $api) => {
    <div class="dot" style={getDotStyle(x,y,size,hover)} 
        mouseenter()={$api.hover = true} mouseleave()={$api.hover = false}>
        if (hover) {
            #**{text}**#
        } else {
            #{text}#
        }
    </div>
}`);

function getDotStyle(x: number, y: number, size: number, hover: boolean = false) {
    let sz = 1.3 * size;
    return `background-color:${hover ? "#ff0" : "#61dafb"};position:absolute;font:normal 15px sans-serif;text-align:center;cursor:pointer;\
        width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;border-radius:${sz / 2}px;line-height:${sz}px;`;
}

const page = template(`(seconds, elapsed) => {
    # This page demonstrates 3 types of parallel updates: #
    <ul>
        <li> # a general scale transformation applied on the main triangle every animation frame # </li>
        <li> # text node updates every second (the number in the blue dots) # </li>
        <li> # text node update on user input (you need to hover one of the blue dots) # </li>
    </ul>
    <i> # code derived from the # <a href="https://stencil-fiber-demo.firebaseapp.com"> # stencil fiber demo # </a></i>
    
    <div id="main" style={computeMainStyle(elapsed)}>
        <*triangle x=0 y=0 size={1e3} seconds={seconds}/>
    </div>
}`);

function computeMainStyle(elapsed) {
    let t = elapsed / 1e3 % 10;
    return `position:absolute;transform-original:0 0;left:50%;top:50%;width:10px;height:10px;\
    background:#eee;transform:scaleX(${(1 + (t > 5 ? 10 - t : t) / 10) / 2.1}) scaleY(0.7) translateZ(0.1px)`;
}

function main() {
    let start = Date.now();

    let root = page().attach(document.getElementById("main"));

    function update() {
        let elapsed = Date.now() - start, seconds = Math.floor(elapsed / 1000) % 10 + 1;

        root.refresh({ seconds: seconds, elapsed: elapsed });
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}
main();
