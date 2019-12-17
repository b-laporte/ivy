
// @ts-ignore
import content from './examples.xdf';
import { NavigationState } from '../nav';
import { Router, Route } from '../../iv/router';

export function loadRoutes(r: Router): void {
    r.add({
        "/examples/*": (r: Route, ns: NavigationState) => {
            ns.currentPageXdf = content.content;
        }
    });
}
