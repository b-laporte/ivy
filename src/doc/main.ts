import w from './widgets';
// import { xtrContent } from '../iv/xtr-renderer';
import { navBar, NavigationState, navState } from './nav';
import { $template } from "../iv";
import './reset.css';
import './layout.css';

// async function resolver(ref: string): Promise<any> {
//     if (ref === "ivyLogo") return w.ivyLogo;
//     if (ref === "infoBlock") return infoBlock;
//     if (ref === "code") return w.code;

//     console.error("UNRESOLVED XTR REFERENCE: " + ref);
//     return null;
// }


const main = $template`(navState:NavigationState) => {
    <*navBar {navState}/>
    <div class="root">
        $if (typeof navState.pageContent === "string") {
            <div class="main"> // @xtrContent(xtr={navState.pageContent} {resolver})
                MAIN
            </>
        } else if (navState.pageContent) {
            <div class="main">
                <*navState.pageContent/>
            </>
        } else {
            $log("main template: invalid pageContent");
        }
    </div>
}`;

main().attach(document.body).render({ navState: navState });
