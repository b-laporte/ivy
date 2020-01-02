import { template } from '../iv';
import { Data } from '../trax';

// @ts-ignore
import overview from './home.xdf';

import './samples.xdf'; // to generate samples.json
import { newRouter, Route, link, activeLink } from '../iv/router';


@Data export class NavigationState {
    homePage = true;
    xdfContent = "";
}
export const navState = new NavigationState();

// router.add({
//     "/": () => {
//         navigationData.currentPageXdf = overview.content;
//     },
//     "/tutorial/*": router.load('tutorial'), // once loaded, will create "tutorial/:"
//     "/examples/*": router.load('examples'),
//     "/api/*": fetchXsd('api'),
// })
// @link -> onclick + add/remove 'activeLink' class -> links must register/unregister to router change?
// @active="/foo/bar/*"

// router
const router = newRouter();

router.add({
    "/*": {
        load(r: Route, ns: NavigationState) {
            ns.homePage = true;
            ns.xdfContent = overview.content;
        },
        unload(r: Route, ns: NavigationState) {
            ns.homePage = false;
        }
    },
    "/tutorial/*": router.deferLoad(() => import('./tutorial/tutorial')),
    "/examples/*": router.deferLoad(() => import('./examples/examples'))
});
router.init(navState, window, "#");

export const ivyLogo = template(`(className="ivyLogoDark") => {
    <svg class={className} width="105px" height="44px" viewBox="0 0 105 44">
        <g transform="translate(3,3)" fill="none" fill-rule="nonzero" stroke-linecap="round" stroke-width="7">
            <path d="M12.5,0.5 L0.5,21.5"/>
            <polyline stroke-linejoin="round" points="55.5 0.5 43.2291116 21.5970036 31.1303622 0.5"/>
            <polyline stroke-linejoin="round" points="98.3696378 1 86.1524963 22.0575024 77.9815673 36.5759163 86.1848189 22.0575024 74 1"/>
        </g>
    </svg>
}`);

export const navBar = template(`(navState:NavigationState) => {
    <nav class="mainMenu">
        <div class="container">
            <span class="mainLogo" @link="/">
                <*ivyLogo className={navState.homePage? "ivyLogoDark" : "ivyLogoLight"}/>
            </>
            <div class="menu">
                <ul class="primary">
                    <li @activeLink="/tutorial"> # tutorial # </li>
                    <li @activeLink="/examples"> # examples # </li>
                    <li> # getting-started # </li>
                    <li> # api # </li>
                    <li>
                        // github logo
                        <svg class="ghLogo" width="20px" height="20px" viewBox="0 0 23 23">
                            <g class="logo" stroke="none" stroke-width="1" fill-rule="evenodd">
                                <path d="M11.9945425,0.455 C5.54802758,0.455 0.32,5.68231082 0.32,12.130976 C0.32,17.2894782 3.66510621,21.6652813 8.30467606,23.2091765 C8.88883324,23.3166901 9.10171015,22.9561612 9.10171015,22.646522 C9.10171015,22.3698537 9.09167555,21.6351775 9.08594149,20.6611044 C5.83831427,21.3663935 5.15309432,19.0957065 5.15309432,19.0957065 C4.62197717,17.7467693 3.8564804,17.3876739 3.8564804,17.3876739 C2.79639639,16.6637491 3.93675722,16.6780842 3.93675722,16.6780842 C5.10865537,16.7605113 5.72506662,17.8815197 5.72506662,17.8815197 C6.76651495,19.6655285 8.45806212,19.15018 9.12321287,18.8512923 C9.22929295,18.0972636 9.53104776,17.5826319 9.8643399,17.2909117 C7.27182883,16.9963244 4.5460009,15.9942978 4.5460009,11.5202988 C4.5460009,10.2459044 5.00114177,9.20302256 5.74800286,8.38735278 C5.62758763,8.09204878 5.22692032,6.90438198 5.86268402,5.29741216 C5.86268402,5.29741216 6.84249122,4.98347247 9.07303986,6.49439681 C10.0041076,6.23493068 11.0032672,6.10591437 11.995976,6.10089707 C12.9879681,6.10591437 13.986411,6.23493068 14.9189122,6.49439681 C17.1480273,4.98347247 18.126401,5.29741216 18.126401,5.29741216 C18.7635982,6.90438198 18.3629309,8.09204878 18.2432325,8.38735278 C18.9915271,9.20302256 19.4430841,10.2459044 19.4430841,11.5202988 C19.4430841,16.0057659 16.7129557,16.9927406 14.1125603,17.2815938 C14.5311465,17.6421227 14.9045771,18.3545795 14.9045771,19.4440505 C14.9045771,21.0044311 14.8902419,22.2637737 14.8902419,22.646522 C14.8902419,22.9590282 15.1009686,23.3224242 15.6930101,23.2084597 C20.3289961,21.6609808 23.6712353,17.2880446 23.6712353,12.130976 C23.6712353,5.68231082 18.4432077,0.455 11.9945425,0.455"/>
                            </>
                        </>
                    </>
                </>
            </>
        </>
    </>
}`, ivyLogo, activeLink, link);

/*
Main pages
#overview (or '' / default) -> home page
#tutorial/overview
#tutorial/components/a/b/c
#examples/exampleXXX -> examples
#api/xjs/template
#api/xdf/xxx
#api/trax/xxx

Todo: anchors in a given page?
-> local links / external links?
*/

