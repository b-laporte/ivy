import { template, Controller, API } from "../../iv";
import { Data, isMutating } from '../../trax';
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
    focused = false;        // true when a row gets the focus
    summary: IvContent;     // displayed when row is collapsed
    caption: RowCaption;    // displayed first when row is expanded
    $content: IvContent;    // displayed second when row is expanded
}

@API class GridAPI {
    // list of rows
    rowList: Row[];
}

@Controller class GridCtl {
    $api: GridAPI;
    $template: IvTemplate;

    focusColor = "#198fd8";
    expandedCount = 0;
    defaultFocusedRow: Row | null = null;

    toggleRow(row: Row) {
        row.expanded = !row.expanded;
    }

    rowFocused(row: Row) {
        // called when the row main elt gets focused
        row.focused = true;
        this.defaultFocusedRow = row;
    }

    rowBlurred(row: Row) {
        // called when the row main elt gets blurred
        row.focused = false;
        this.defaultFocusedRow = row;
    }

    rowKeyDown(evt, row: Row) {
        // called when the row main elt gets a key down
        let key = evt.which || evt.keyCode;
        switch (key) {
            case KEY_SPACE:
                this.toggleRow(row);
                evt.cancelBubble = true;
                evt.preventDefault();
                break;
            case KEY_ARROW_DOWN:
            case KEY_ARROW_UP:
                let r = this.getNextRow(row, key === KEY_ARROW_DOWN);
                if (r) {
                    row.focused = false;
                    r.focused = true;
                    evt.cancelBubble = true;
                    evt.preventDefault();
                }
        }
    }

    getNextRow(row: Row, down: boolean): Row | null {
        let rows = this.$api.rowList, len = rows.length;
        if (len) {
            if (len === 1) {
                return rows[0];
            }
            let prevRow = rows[len - 1], r: Row;
            for (let i = 0; len > i; i++) {
                r = rows[i];
                if (row === r) {
                    if (!down) return prevRow;
                    if (i + 1 < len) return rows[i + 1];
                    return rows[0];
                }
                prevRow = r;
            }
        }
        return null;
    }

    $beforeRender() {
        // check expandedCount and defaultFocusedRow
        let rows = this.$api.rowList, count = 0, dfr = this.defaultFocusedRow, dfrFound = false;
        for (let row of rows) {
            if (row.expanded) {
                count++;
            }
            if (row === dfr) {
                dfrFound = true;
            }
        }
        this.expandedCount = count;
        if (!dfrFound) {
            this.defaultFocusedRow = (rows.length === 0) ? null : rows[0];
        }
    }

    $afterRender() {
        let fRow = this.$template.query("#focusedRow");
        if (fRow) {
            fRow.focus();
        }
    }
}

export const grid = template(`($:GridCtl) => {
    let rowList = $.$api.rowList, 
        helpLabelDisplayed = false,
        expandedCount = $.expandedCount,
        defaultFocusedRow = $.defaultFocusedRow;
    <div class="grid" #root>
        
        for (let idx=0; rowList.length>idx; idx++) {
            let row = rowList[idx];
    
            <div class={getRowClass(row)} >  // todo: support @class()
    
                if (!row.expanded) {
                    // collapsed row: display summary
                    <div class="cfc-expanding-row-summary" tabindex={(expandedCount===0 && row===defaultFocusedRow)? '0' : '-1'} 
                        style={row.focused? "color:"+$.focusColor : ""}
                        @onclick={e=>$.toggleRow(row)}
                        @onfocus={e=>$.rowFocused(row)}
                        @onkeydown={e=>$.rowKeyDown(e,row)}
                        @onblur={e=>$.rowBlurred(row)} 
                        #focusedRow={row.focused}
                    >
                        <! @content={row.summary}/>
                        
                        <div class="cfc-expanding-row-accessibility-text"> #.# </div>
                        <div class="cfc-expanding-row-accessibility-text"
                            i18n="This is the label used to indicate that the user is in a list of expanding rows.">
                            # Row {idx + 1} in list of expanding rows. #
                        </div>
                        if (!helpLabelDisplayed) {
                            <div class="cfc-expanding-row-accessibility-text"
                                i18n="This is the label used for the first row in list of expanding rows.">
                                # Use arrow keys to navigate. #
                            </div>
                            helpLabelDisplayed = true;
                        }
                    </div>
                } else {
                    // expanded row: caption first
                    <div class="cfc-expanding-row-details-caption" 
                        @onclick={e=>$.toggleRow(row)}
                        @onfocus={e=>$.rowFocused(row)}
                        @onblur={e=>$.rowBlurred(row)}
                        @onkeydown={e=>$.rowKeyDown(e,row)}
                        tabindex="0" // always focusable when expanded
                        style={"color:white;background-color:"+row.caption.color} 
                        @content={row.caption.$content}
                        #focusedRow={row.focused}
                    />
                    // content
                    <div class="cfc-expanding-row-details-content" @content={row.$content}/>
                }
            </div>
        }
    </div>
}`);

function getRowClass(row: Row) {
    // this function should be removed when @class() is implemented
    let cls = ["cfc-expanding-row"];
    if (row.focused) cls.push("cfc-expanding-row-has-focus");
    if (row.expanded) cls.push("cfc-expanding-row-is-expanded");
    return cls.join(" ");
}
