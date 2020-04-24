import { privacy } from './privacy';
import { actionMenu } from './action';
import './styles.css'; // rollup dependency

import { $template } from "../../../iv";
import { response } from "./response";
import { textResult, rating } from './textResult';
import { link } from './link';
import { panel } from './panel';
import { box } from './boxes';
import { searchBanner } from './searchBanner';

const w = {
    link,
    textResult,
    actionMenu,
    panel,
    rating,
    privacy,
    box,
    searchBanner
}

const main = $template`(data) => {
    <div class="banner"> // @xtrContent(xtr={data.banner} {resolver})
        <*data.banner {w}/>
    </>
    <div class="main">
        <div class="top_panel"> //@xtrContent(xtr={data.topPanel} {resolver})
            <*data.topPanel {w}/>
        </>
        <*box>
            <.cell class="main_colA">
                //class="col center_col"
                //<div @xtrContent(xtr={data.mainPanel} {resolver}) />
                <*data.mainPanel {w}/>
            </>
            <.cell class="main_colB">
                // class="col"
                // <div @xtrContent(xtr={data.sidePanel} {resolver})/>
                <*data.sidePanel {w}/>
            </>
        </>
    </>
}`;

let tpl = main()
    .attach(document.getElementById("app"))
    .render({ data: response });
