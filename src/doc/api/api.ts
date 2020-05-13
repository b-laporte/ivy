import { Router, Route } from '../../iv/router';
import { NavigationState } from '../nav';
import { $template } from '../../iv';
import { IvEvent } from '../../iv/events';
import { retrieveMenuItem, MenuPageState, menuLayout, MenuContent } from '../menu-layout';

const pageState = new MenuPageState();
let router: Router;

export function loadRoutes(r: Router): void {
    router = r;
    r.add({
        "/api/*": (r: Route, ns: NavigationState) => {
            ns.pageContent = pageLayout;
            pageState.categoryCode = content.categories[0].code;
            pageState.itemCode = content.categories[0].items[0].code;
        }
    });
}

const todo = $template`() => {
    <!cdata @@md>
    # under construction...
    </!cdata>
}`;

const content: MenuContent = {
    categories: [{
        title: "todo",
        code: "base",
        items: [{
            title: "todo", code: "todo", content: todo
        }]
    }]
};

function handleMenuClick(e: IvEvent) {
    router!.navigate("/api/" + e.data);
}

const pageLayout = $template`() => {
    <*menuLayout state={pageState} {content} @onchange={handleMenuClick}/>
}`;
