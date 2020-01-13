
import content from './content';
import { NavigationState } from '../nav';
import { Router, Route } from '../../iv/router';

export function loadRoutes(r: Router): void {
    r.add({
        "/tutorial/*": (r: Route, ns: NavigationState) => {
            ns.pageContent = content;
        }
    });
}
