import { xdfContent } from './../iv/xdf-renderer';
import { navBar, NavigationState, navState } from './nav';
import { template } from "../iv";
import './reset.css';
import './layout.css';

async function resolver(ref: string): Promise<any> {
    // if (ref === "link") return link;

    console.error("UNRESOLVED XDF REFERENCE: " + ref);
    return null;
}

const main = template(`(navState:NavigationState) => {
    <*navBar {navState}/>
    <div class="main" @xdfContent(xdf={navState.currentPageXdf} {resolver}) />
}`, NavigationState, navBar, resolver, xdfContent);

main().attach(document.body).render({ navState: navState });
