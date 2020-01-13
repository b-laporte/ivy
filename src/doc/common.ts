import { template } from "../iv";

export const ivyLogo = template(`(className="ivyLogoDark") => {
    <svg class={className} width="105px" height="44px" viewBox="0 0 105 44">
        <g transform="translate(3,3)" fill="none" fill-rule="nonzero" stroke-linecap="round" stroke-width="7">
            <path d="M12.5,0.5 L0.5,21.5"/>
            <polyline stroke-linejoin="round" points="55.5 0.5 43.2291116 21.5970036 31.1303622 0.5"/>
            <polyline stroke-linejoin="round" points="98.3696378 1 86.1524963 22.0575024 77.9815673 36.5759163 86.1848189 22.0575024 74 1"/>
        </g>
    </svg>
}`);

const triangle = template(`(pos:string = "top") => {
    const scale = (pos==="top")? -0.8 : 0.8;

    <svg width="38px" height="21px" viewBox="0 0 38 21" class={pos}>
        <g class="triangle" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linejoin="round">
            <g transform="translate(-308, -180)" fill-rule="nonzero">
                <polygon transform={"translate(327, 191) scale(1, "+scale+") translate(-327, -188) "}
                    points="327 181 345 201 309 201" />
            </g>
        </g>
    </svg>
}`);

const RX_TOP = /top/, RX_BOTTOM = /bottom/;

export const code = template(`($content:IvContent, indicators="top") => {
    <div class={"code "+indicators.replace(";"," ")}>
        if (indicators.match(RX_TOP)) {
            <*triangle pos="top"/>
        }
        <! @content/>
        if (indicators.match(RX_BOTTOM)) {
            <*triangle pos="bottom"/>
        }
    </>
}`, triangle, RX_TOP, RX_BOTTOM);
