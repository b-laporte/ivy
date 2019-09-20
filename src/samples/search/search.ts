import { privacy } from './privacy';
import { actionMenu } from './action';
import { innerXTML } from './../../iv/xtml-renderer';
require('./index.html'); // webpack dependency
require('./styles.css'); // webpack dependency

import { template } from "../../iv";
import { response } from "./response";
import { textResult, rating } from './textResult';
import { link } from './link';
import { panel } from './panel';
import { box } from './boxes';
import { searchBanner } from './searchBanner';

async function resolver(ref: string): Promise<any> {
    if (ref === "link") return link;
    if (ref === "textResult") return textResult;
    if (ref === "actionMenu") return actionMenu;
    if (ref === "panel") return panel;
    if (ref === "rating") return rating;
    if (ref === "privacy") return privacy;
    if (ref === "boxes") return box;
    if (ref === "searchBanner") return searchBanner;

    console.error("UNRESOLVED XTML REFERENCE: " + ref);
    return null;
}

const main = template(`(data) => {
    <div class="banner" @innerXTML(xtml={data.banner} {resolver})/>
    <div class="main">
        <div class="top_panel" @innerXTML(xtml={data.topPanel} {resolver})/>
        <*box>
            <.cell class="main_colA">
                //class="col center_col"
                <div @innerXTML(xtml={data.mainPanel} {resolver}) />
            </>
            <.cell class="main_colB">
                // class="col"
                <div @innerXTML(xtml={data.sidePanel} {resolver})/>
            </>
        </>
    </>
    
}`);

let tpl = main()
    .attach(document.getElementById("app"))
    .render({ data: response });
