import { Router, Route } from '../../iv/router';
import { NavigationState } from '../nav';
import { $template } from '../../iv';
import { IvEvent } from '../../iv/events';
import { retrieveMenuItem, MenuPageState, menuLayout, MenuContent } from '../menu-layout';
import { philosophy, templateDef, elementNodes, params, textNodes, comments, bindings, decorators, labels, jsStatements, contentProjection, preProcessors } from './xjs';

const pageState = new MenuPageState();
let router: Router;

export function loadRoutes(r: Router): void {
    router = r;
    r.add({
        "/api/*": (r: Route, ns: NavigationState) => {
            ns.pageContent = pageLayout;
            pageState.categoryCode = content.categories[0].code;
            pageState.itemCode = content.categories[0].items[0].code;
        },
        "/api/:name": (r: Route, ns: NavigationState) => {
            ns.pageContent = pageLayout;
            retrieveMenuItem(pageState, r.pathParams!.name, content);
        }
    });
}

const content: MenuContent = {
    categories: [{
        title: "xjs",
        code: "base",
        items: [{
            title: "general philosophy", code: "xjs_philosophy", content: philosophy
        },{
            title: "template definition", code: "tpl_def", content: templateDef
        },{
            title: "element nodes", code: "xjs", content: elementNodes
        },{
            title: "params, attributes and properties", code: "params", content: params
        },{
            title: "text nodes", code: "text_nodes", content: textNodes
        },{
            title: "comments", code: "comments", content: comments
        },{
            title: "binding expressions", code: "bindings", content: bindings
        },{
            title: "decorators", code: "decorators", content: decorators
        },{
            title: "labels", code: "labels", content: labels
        },{
            title: "js statements", code: "js_statements", content: jsStatements
        },{
            title: "content projection", code: "content_projection", content: contentProjection
        },{
            title: "pre-processors", code: "pre_processors", content: preProcessors
        }]
    }]
};

function handleMenuClick(e: IvEvent) {
    router!.navigate("/api/" + e.data);
}

const pageLayout = $template`() => {
    <*menuLayout state={pageState} {content} @onchange={handleMenuClick}/>
}`;
