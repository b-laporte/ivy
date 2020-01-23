// @@extract: all
import { template } from '../../../iv';
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
const menu = template(`(header:MenuHeader, optionList: MenuOption[]) => {
    <div class="menu" @onclick={e=>handleEvent(e.target)}>
        if (header) {
            if (header.title) {
                <div class="title"> # {header.title} # </>
                if (header.optionList.length) {
                    // header list
                    <ul class="header list">
                        for (let option of header.optionList) {
                            <li class="option" 
                                data-code={option.id} 
                                @content={option.$content}
                            />
                        }
                    </>
                }
            }
        }
        // main list
        <ul class="main list">
            for (let option of optionList) {
                <li class="option" data-code={option.id} @content={option.$content}/>
            }
        </>
    </>
}`, handleEvent, MenuOption, MenuHeader);

function handleEvent(target) {
    // we should raise an event here (cf. next example)
    if (target && target.dataset) {
        document.getElementById("logs")!.innerHTML = 
            `You clicked on menu item ${target.dataset.code}`;
    }
}

// @@extract: main
const main = template(`(extraLength=3, $api) => {
    <div class="commands">
        # Number of extras: #
        <button @onclick={=>$api.extraLength++}> # + # </>
        <button @onclick={=>$api.extraLength--}> # - # </>
    </div>
    <*menu>
        <.header title="Preferred options:">
            <.option id="A"> # Value A # </>
            <.option id="C"> # Value C # </>
        </>
        <.option id="A"> # Value A # </>
        <.option id="B"> # Value B # </>
        <.option id="C"> # Value C # </>
        for (let i=0;extraLength>i;i++) {
            <.option id={"X"+i}> # Extra \#{i} # </>
        }
    </>
}`, menu);

main().attach(document.getElementById("output")).render();
