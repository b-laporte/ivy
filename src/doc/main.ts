import { code, ivyLogo } from './common';
import { xtrContent } from '../iv/xtr-renderer';
import { navBar, NavigationState, navState } from './nav';
import { template } from "../iv";
import './reset.css';
import './layout.css';

async function resolver(ref: string): Promise<any> {
    if (ref === "ivyLogo") return ivyLogo;
    if (ref === "infoBlock") return infoBlock;
    if (ref === "code") return code;

    console.error("UNRESOLVED XTR REFERENCE: " + ref);
    return null;
}

// information block used on the home page
// e.g. <*infoBlock title="easy" bkgColor="#FF7019" proportions="2;1;9;0.5">
const infoBlock = template(`(title="[title]", className="variantA", proportions="2;2;10;1", $content) => {
    let props = proportions.split(";");
    if (props.length!==4) {
        console.log("[*infoBlock] Invalid proportions value: "+proportions);
    }
    <div class={"infoBlock "+className}>
        for (let i=0; 4>i; i++) {
            if (props[i]==="0") continue; // don't create div for this case

            <div style={"flex:" + props[i]} class={(i==2)? "content" : ""}>
                if (i===1) {
                    <div class="title"> # {title} # </div>
                } else if (i===2) {
                    <! @content/>
                }
            </>
        }
    </>
}`);

const main = template(`(navState:NavigationState) => {
    <*navBar {navState}/>
    <div class="root">
        if (typeof navState.pageContent === "string") {
            <div class="main" @xtrContent(xtr={navState.pageContent} {resolver}) />
        } else if (navState.pageContent) {
            <div class="main">
                <*navState.pageContent/>
            </>
        } else {
            console.warn("main template: invalid pageContent");
        }
    </div>
}`, NavigationState, navBar, resolver, xtrContent);

main().attach(document.body).render({ navState: navState });
