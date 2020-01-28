// @@extract: all
import { template, API } from '../../../iv';
import { Data } from '../../../trax';
import { IvContent } from '../../../iv/types';
import { IvEventEmitter } from './../../../iv/events';

// @@extract: menu
@Data class MenuOption {
    id: string;
    $content: IvContent;
}

const menu = template(`(optionList: MenuOption[], clickEmitter:IvEventEmitter, $) => {
    <div class="menu" @onclick={e=>raiseEvent($, e.target)}>
        <ul class="main list">
            for (let option of optionList) {
                <li class="option" data-code={option.id} @content={option.$content}/>
            }
        </>
    </>
}`, MenuOption, IvEventEmitter, raiseEvent);

function raiseEvent(api, target) {
    if (target && target.dataset) {
        api.clickEmitter.emit(target.dataset.code);
    }
}

// @@extract: main
@API class Main {
    extraLength = 3;
    message = "";
}
const main = template(`($:Main) => {
    <div class="commands">
        # Number of extras: #
        <button @onclick={=>$.extraLength++}> # + # </>
        <button @onclick={=>$.extraLength--}> # - # </>
    </div>
    <*menu @onclick={e => $.message="You clicked on item "+e.data}>
        <.option id="A"> # Value A # </>
        <.option id="B"> # Value B # </>
        <.option id="C"> # Value C # </>
        for (let i=0;$.extraLength>i;i++) {
            <.option id={"X"+i}> # Extra \#{i} # </>
        }
    </>
    <div class="logs"> #{$.message}# </>
}`, menu);

main().attach(document.getElementById("output")).render();
