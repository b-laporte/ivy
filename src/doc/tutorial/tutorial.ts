
// @ts-ignore
import content from './tutorial.xdf';
import { NavigationData } from '../nav';

export function load(nav: NavigationData) {
    nav.currentPageXdf = content.content;
}


console.log("Tutorial nav controller loaded");
