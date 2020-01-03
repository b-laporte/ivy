
import content from './content';
import { NavigationState } from '../nav';
import { Router, Route } from '../../iv/router';

export function loadRoutes(r: Router): void {
    r.add({
        "/examples/*": (r: Route, ns: NavigationState) => {
            ns.xtrContent = content;
        },
        "/examples/:name": (r: Route, ns: NavigationState) => {
            ns.xtrContent = content;
            console.log("nav route:", r.pathParams!.name);
        }
    });
}
