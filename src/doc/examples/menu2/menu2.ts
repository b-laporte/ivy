// @@extract: import
import { $template, API } from '../../../iv';
import { Data } from '../../../trax';
import { IvContent } from '../../../iv/types';
import { IvEventEmitter } from './../../../iv/events';

// @@extract: menu-data
@Data class MenuOption {
    id: string;
    $content: IvContent;
}
@API class Menu {
    optionList: MenuOption[];
    clickEmitter:IvEventEmitter;
}
// @@extract: menu
const menu = $template`($api:Menu) => {
    <div class="menu" @onclick={e=>raiseEvent($api, e.target)}>
        <ul class="main list">
            $for (let option of $api.optionList) {
                <li class="option" data-code={option.id} @content={option.$content}/>
            }
        </>
    </>
}`;

function raiseEvent($api: Menu, target) {
    if (target && target.dataset) {
        $api.clickEmitter.emit(target.dataset.code);
    }
}

// @@extract: main
@API class Main {
    extraLength = 3;
    message = "";
}
const main = $template`($api:Main) => {
    <div class="commands">
        Number of extras:
        <button @onclick={=>$api.extraLength++}> + </>
        <button @onclick={=>$api.extraLength--}> - </>
        <span class="event-log"> {$api.message} </> // event feedback will be displayed here
    </div>
    // @@extract: menu-usage
    <*menu @onclick={e => $api.message="You clicked on item "+e.data}>
        // @@extract: menu-content
        <.option id="A"> Value A </>
        <.option id="B"> Value B </>
        <.option id="C"> Value C </>
        $for (let i=0;$api.extraLength>i;i++) {
            <.option id={"X"+i}> Extra #{i} </>
        }
    </>
    // @@extract: menu-usage-end
}`;
// @@extract: instantiation
main().attach(document.getElementById("output")).render();
