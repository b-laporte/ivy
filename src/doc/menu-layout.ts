import { IvEventEmitter } from './../iv/events';
import { $template } from "../iv";
import { Data } from '../trax';
import { IvTemplate } from '../iv/types';


interface Menuitem {
    title: string;
    code: string;
    content: () => IvTemplate;
}
interface MenuCategory {
    title: string;
    code: string;
    items: Menuitem[];
}
export interface MenuContent {
    categories: MenuCategory[];
}


@Data export class MenuPageState {
    categoryCode: string;
    itemCode: string;
}

export function retrieveMenuItem(state:MenuPageState, itemCode: string, content, setOnPageState = true) {
    let defaultCategory = "", defaultItem: any, defaultItemCode = "";

    for (let cat of content.categories) {
        if (defaultCategory === "") {
            defaultCategory = cat.code;
        }
        for (let itm of cat.items) {
            if (defaultItemCode === "") {
                defaultItemCode = itm.code;
            }
            if (itm.code === itemCode) {
                if (setOnPageState) {
                    state.itemCode = itemCode;
                    state.categoryCode = cat.code;
                }
                return itm;
            }
        }
    }
    // not found
    if (setOnPageState) {
        state.categoryCode = defaultCategory;
        state.itemCode = defaultItemCode;
        return defaultItem;
    } else {
        return { title: "", code: "error", content: "" }
    }
}

const menu = $template`(content, state:MenuPageState, selectEmitter:IvEventEmitter,$api) => {
    <div class="main_menu" @onclick={e=>handleMenuClick(e,$api)}>
        $each (content.categories, (cat, idx, isLast) => {
            $let catSelected = cat.code===state.categoryCode? " selected" : "";
            $let first = (idx===0)? " first" : "";
            $let last = isLast? " last" : "";
            <div class={"menu cat container" + catSelected + first + last}> 
                <div class="title"> {cat.title} </div>
                <ul class="content">
                    $for (let itm of cat.items) {
                        <li data-page={itm.code} class={(itm.code === state.itemCode)?"selected":""}>
                            {itm.title}
                        </>
                    }
                </>
            </div>
        });
    </>
}`;

function handleMenuClick(e: Event,$api) {
    const ds = (e.target as any).dataset;
    if (ds.page) {
        $api.selectEmitter.emit(ds.page);
    }
}

// <*menuLayout> : main example layout
export const menuLayout = $template`(state:MenuPageState, content, changeEmitter:IvEventEmitter) => {
    $let item = retrieveMenuItem(state, state.itemCode, content);
    <div class="examples layout layout2">
        <div class="blockA2">
            <div class="menu">
                <*menu {content} {state} @onselect={e=>changeEmitter.emit(e.data)}/>
            </>
            <div class="mainpanel">
                <div>
                    $if (item && item.content) {
                        <*item.content/>
                    } else if (!item) {
                        $log("[*menuLayout] Menu item not found");
                    }
                </>
                <div class="legal">
                    <p> Code and documentation licensed under MIT </>
                    <p> Copyright © 2020 Amadeus SAS </>
                </>
            </>
        </>
    </div>
}`;