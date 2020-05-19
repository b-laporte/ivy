import { $template } from '../iv';
import { Data } from '../trax';
import homeContent from './home';
import { newRouter, Route, link, activeLink } from '../iv/router';
import w, { IVY_GH_REPO } from "./widgets"

@Data export class NavigationState {
    homePage = false;
    pageContent: any = ""; // xtr string or component reference
}
export const navState = new NavigationState();

// router
const router = newRouter();

router.add({
    "/*": {
        load(r: Route, ns: NavigationState) {
            ns.homePage = true;
            ns.pageContent = homeContent;
        },
        unload(r: Route, ns: NavigationState) {
            ns.homePage = false;
        }
    },
    "/examples/*": router.deferLoad(() => import('./examples/examples')),
    "/getting-started/*": router.deferLoad(() => import('./getting-started/getting-started')),
    "/api/*": router.deferLoad(() => import('./api/api'))
});
router.init(navState, window, "#");

export const navBar = $template`(navState:NavigationState) => {
    <nav class="mainMenu">
        <div class="container">
            <span class="mainLogo" @link="/">
                <*w.ivyLogo className="ivyLogo"/>
            </>
            <div class="menu">
                <ul class="primary">
                    <li @activeLink="/examples"> examples </li>
                    <li @activeLink="/getting-started"> getting-started </li>
                    <li @activeLink="/api"> api </li>
                    <li>
                        // github logo
                        <a href={IVY_GH_REPO} target="_blank" title="Open github repository"> 
                            <*w.githubBtn className="ghLogo"/>
                        </>
                    </>
                </>
            </>
        </>
    </>
}`;
