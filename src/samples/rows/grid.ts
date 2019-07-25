import { template, Controller, API } from "../../iv";
import { Data, isMutating } from '../../trax/trax';
import { IvContent, IvTemplate } from '../../iv/types';

const KEY_SPACE = 32,
    KEY_ARROW_UP = 38,
    KEY_ARROW_DOWN = 40;

@Data class RowCaption {
    color = "#198fd8"; // lighter than 'blue' as blue makes links hard to see
    $content: IvContent;
}

@Data class Row {
    id: any = "";
    expanded = false;
    focused = false;
    summary: IvContent;     // displayed when row is collapsed
    caption: RowCaption;    // displayed first when row is expanded
    $content: IvContent;    // displayed second when row is expanded
}

@API class GridAPI {
    // list of rows
    rowList: Row[];

    // id of the row that should get the focus through keyboard navigation
    // default will the first row
    focusRowID: any;
}

@Controller class GridCtl {
    $api: GridAPI;
    $template: IvTemplate;

    focusRowIdx: number = 0;    // index of the focus row (cf. $api.focusRowID)
    focusColor = "#198fd8";

    processFocusRowIdx(): number {
        let rows = this.$api.rowList, len = rows.length;
        this.focusRowIdx = len ? 0 : -1;
        if (len) {
            let fId = this.$api.focusRowID;
            for (let i = 0; len > i; i++) {
                if (fId === rows[i].id) {
                    return this.focusRowIdx = i;
                }
            }
        }
        return this.focusRowIdx;
    }

    toggleRow(row: Row) {
        row.expanded = !row.expanded;
    }

    rowFocused(row: Row) {
        // called when the row main elt gets focused
        row.focused = true;
    }

    rowBlurred(row: Row) {
        // called when the row main elt gets blurred
        row.focused = false;
    }

    rowKeyDown(evt, row: Row) {
        let key = evt.which || evt.keyCode;
        switch (key) {
            case KEY_SPACE:
                this.toggleRow(row);
                evt.cancelBubble = true;
                evt.preventDefault();
                break;
        }
    }

    async refocusFocusedRow() {
        let rowElts = this.$template.query("#row", true);
        if (rowElts) {
            for (let div of rowElts) {
                if (div.dataIsFocused) {
                    div.focus();
                }
            }
        }
    }
}

export const grid = template(`($ctl:GridCtl) => {
    let rowList = $ctl.$api.rowList, 
        hasFocusedRow = false,
        focusRowIdx = $ctl.processFocusRowIdx();

    <div class="grid" #root>
        
        for (let idx=0; rowList.length>idx; idx++) {
            let row = rowList[idx];
            hasFocusedRow = hasFocusedRow || row.focused;
    
            <div class={getRowClass(row)} >  // todo: support @class()
    
                if (!row.expanded) {
                    // collapsed row: display summary
                    <div class="cfc-expanding-row-summary" tabindex={(idx===focusRowIdx)? '0' : '-1'} 
                        style={row.focused? "color:"+$ctl.focusColor : ""}
                        click()={$ctl.toggleRow(row)}
                        focus()={$ctl.rowFocused(row)}
                        keydown(e)={$ctl.rowKeyDown(e,row)}
                        blur()={$ctl.rowBlurred(row)} 
                        [dataIsFocused]={row.focused}
                        #row>
                        
                        <! @content={row.summary}/>
                        
                        <div class="cfc-expanding-row-accessibility-text"> #.# </div>
                        <div class="cfc-expanding-row-accessibility-text"
                            i18n="This is the label used to indicate that the user is in a list of expanding rows.">
                            # Row {idx + 1} in list of expanding rows. #
                        </div>
                        // if (isPreviouslyFocusedRow(idx)) {
                        //     <div class="cfc-expanding-row-accessibility-text"
                        //         i18n="This is the label used for the first row in list of expanding rows.">
                        //         # Use arrow keys to navigate. #
                        //     </div>
                        // }
                    </div>
                } else {
                    // expanded row: caption first
                    <div class="cfc-expanding-row-details-caption" 
                        click()={$ctl.toggleRow(row)}
                        focus()={$ctl.rowFocused(row)}
                        blur()={$ctl.rowBlurred(row)}
                        keydown(e)={$ctl.rowKeyDown(e,row)}
                        tabindex="0" // always focusable when expanded
                        style={"color:white;background-color:"+row.caption.color} 
                        @content={row.caption.$content}
                        [dataIsFocused]={row.focused}
                        #row
                    />
                    // content
                    <div class="cfc-expanding-row-details-content" @content={row.$content}/>
                }
            </div>
        }

    </div>

    if (hasFocusedRow) {
        setTimeout(() => {
            $ctl.refocusFocusedRow();
        }, 0);
    }
}`);

function getRowClass(row: Row) {
    // this function should be removed when @class() is implemented
    let cls = ["cfc-expanding-row"];
    if (row.focused) cls.push("cfc-expanding-row-has-focus");
    if (row.expanded) cls.push("cfc-expanding-row-is-expanded");
    return cls.join(" ");
}
