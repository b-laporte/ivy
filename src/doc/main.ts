import { xdfContent } from './../iv/xdf-renderer';
import { navBar, NavigationData, navigationData } from './nav';
import { template } from "../iv";
import './reset.css';
import './layout.css';

async function resolver(ref: string): Promise<any> {
    // if (ref === "link") return link;

    console.error("UNRESOLVED XDF REFERENCE: " + ref);
    return null;
}

const main = template(`(navState:NavigationData) => {
    <*navBar {navState}/>
    <div class="main" @xdfContent(xdf={navState.currentPageXdf} {resolver}) />
}`, NavigationData, navBar, resolver, xdfContent);

main().attach(document.body).render({ navState: navigationData });
