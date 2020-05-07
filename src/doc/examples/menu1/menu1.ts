// @@extract: import
import { $template, API } from '../../../iv';
import { Data } from '../../../trax';
import { IvContent } from '../../../iv/types';

// @@extract: data-definition
@Data class MenuOption {
    id: string;
    $content: IvContent;
}

@Data class MenuHeader {
    title: string;
    optionList: MenuOption[];
}

// @@extract: menu
const menu = $template`(header:MenuHeader, optionList: MenuOption[]) => {
    <div class="menu" @onclick={e=>handleEvent(e.target)}>
        $if (header && header.title) {
            <div class="title"> {header.title} </>
            $if (header.optionList.length) {
                // header list
                <ul class="header list">
                    $for (let option of header.optionList) {
                        <li class="option" data-code={option.id} @content={option.$content}
                        />
                    }
                </>
            }
        }
        // main list
        <ul class="main list">
            $for (let option of optionList) {
                <li class="option" data-code={option.id} @content={option.$content}/>
            }
        </>
    </>
}`;

// @@extract: event-handler
function handleEvent(target) {
    // we should raise an event here (cf. next example)
    if (target && target.dataset) {
        document.getElementById("event-log")!.innerHTML =
            `You clicked on menu item ${target.dataset.code}`;
    }
}

// @@extract: main
@API class MainApi {
    // @API is a specialized version of @Data
    extraLength = 2;
}
const main = $template`($api:MainApi) => {
    <div class="commands">
        Number of extras:
        <button @onclick={=>$api.extraLength++}> + </>
        <button @onclick={=>$api.extraLength--}> - </>
        <span id="event-log" /> // event feedback will be displayed here
    </div>
    // @@extract: menu-usage
    <*menu>
        <.header title="Preferred options:">
            <.option id="A"> Value A </>
        </>
        <.option id="A"> Value A </>
        <.option id="B"> Value B </>
        $for (let i=0; $api.extraLength>i; i++) {
            <.option id={"X"+i}> Extra #{i} </>
        }
    </>
    // @@extract: menu-usage-end
}`;

// @@extract: instantiation
main().attach(document.getElementById("output")).render();
