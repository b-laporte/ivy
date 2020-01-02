import { xdfContent } from './../iv/xdf-renderer';
import { navBar, NavigationState, navState, ivyLogo } from './nav';
import { template } from "../iv";
import './reset.css';
import './layout.css';

async function resolver(ref: string): Promise<any> {
    if (ref === "ivyLogo") return ivyLogo;
    if (ref === "infoBlock") return infoBlock;

    console.error("UNRESOLVED XDF REFERENCE: " + ref);
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
        <div class="main" @xdfContent(xdf={navState.xdfContent} {resolver}) />
    </div>
}`, NavigationState, navBar, resolver, xdfContent);

main().attach(document.body).render({ navState: navState });
