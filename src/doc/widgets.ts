import { $template } from "../iv";
import { Data } from '../trax';
import { IvContent } from '../iv/types';

// <*ivyLogo> : the ivy logo
const ivyLogo = $template`(className="ivyLogoDark") => {
    <svg class={className} width="105px" height="44px" viewBox="0 0 105 44">
        <g transform="translate(3,3)" fill="none" fill-rule="nonzero" stroke-linecap="round" stroke-width="7">
            <path d="M12.5,0.5 L0.5,21.5"/>
            <polyline stroke-linejoin="round" points="55.5 0.5 43.2291116 21.5970036 31.1303622 0.5"/>
            <polyline stroke-linejoin="round" points="98.3696378 1 86.1524963 22.0575024 77.9815673 36.5759163 86.1848189 22.0575024 74 1"/>
        </g>
    </svg>
}`;

const triangle = $template`(pos:string = "top") => {
    $let scale = (pos==="top")? -0.8 : 0.8;

    <svg width="38px" height="21px" viewBox="0 0 38 21" class={pos}>
        <g class="triangle" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linejoin="round">
            <g transform="translate(-308, -180)" fill-rule="nonzero">
                <polygon transform={"translate(327, 191) scale(1, "+scale+") translate(-327, -188) "}
                    points="327 181 345 201 309 201" />
            </g>
        </g>
    </svg>
}`;

const RX_TOP = /top/, RX_BOTTOM = /bottom/;

// <*code> : section to host code extracts
const code = $template`($content:IvContent, indicators="top") => {
    <div class={"code "+indicators.replace(";"," ")}>
        $if (indicators.match(RX_TOP)) {
            <*triangle pos="top"/>
        }
        <! @content/>
        $if (indicators.match(RX_BOTTOM)) {
            <*triangle pos="bottom"/>
        }
    </>
}`;

// <*infoBlock> : information block used on the home page
// e.g. <*infoBlock title="easy" bkgColor="#FF7019" proportions="2;1;9;0.5">
const infoBlock = $template`(title="[title]", className="variantA", proportions="2;2;10;1", $content) => {
    $let props = proportions.split(";");
    $if (props.length!==4) {
        $log("[*infoBlock] Invalid proportions value: "+proportions);
    }
    <div class={"infoBlock "+className}>
        $for (let i=0; 4>i; i++) {
            $if (props[i]==="0") {$exec continue;} // don't create div for this case

            <div style={"flex:" + props[i]} class={(i==2)? "content" : ""}>
                $if (i===1) {
                    <div class="title"> {title} </div>
                } else if (i===2) {
                    <! @content/>
                }
            </>
        }
    </>
}`;


@Data class Notion {
    name: string;
    $content: IvContent;
}
// <*notions> : section to highlight specific points covered in an example
const notions = $template`(notionList:Notion[]) => {
    $let len = notionList.length;
    <div class="notions">
        <div class="title"> Notion{len!==1? "s": ""} covered in this example </>
        <ul>
            $for (let notion of notionList) {
                <li class="notion"> 
                    <span class="name"> {notion.name} </>
                    $if (notion.$content) {
                        : <! @content={notion.$content}/>
                    }
                </>
            }
        </>
    </>
}`;

// common widget library
export default {
    ivyLogo,
    code,
    infoBlock,
    notions
}
