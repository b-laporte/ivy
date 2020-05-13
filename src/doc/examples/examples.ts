import content from './toc';
import { NavigationState } from '../nav';
import { Router, Route } from '../../iv/router';
import { Data } from '../../trax';
import { $template } from '../../iv';
import w from '../widgets';
import { IvContent } from '../../iv/types';
import { retrieveMenuItem, MenuPageState, menuLayout } from '../menu-layout';
import { IvEvent } from '../../iv/events';

const pageState = new MenuPageState();
let router: Router;

export function loadRoutes(r: Router): void {
    router = r;
    r.add({
        "/examples/*": (r: Route, ns: NavigationState) => {
            ns.pageContent = pageLayout;
            pageState.categoryCode = content.categories[0].code;
            pageState.itemCode = content.categories[0].items[0].code;
        },
        "/examples/:name": (r: Route, ns: NavigationState) => {
            ns.pageContent = pageLayout;
            retrieveMenuItem(pageState, r.pathParams!.name, content);
        }
    });
}

function handleMenuClick(e:IvEvent) {
    router!.navigate("/examples/" + e.data);
}

const pageLayout = $template`() => {
    <*menuLayout state={pageState} {content} @onchange={handleMenuClick}/>
}`;
