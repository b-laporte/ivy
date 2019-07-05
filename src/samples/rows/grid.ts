import { template, IvContent } from "../../iv";
import { Data } from '../../trax/trax';

@Data class RowCaption {
    color = "#198fd8"; // lighter than 'blue' that makes link hard to see
    $content: IvContent;
}

@Data class Row {
    id: any = "";
    expanded = false;
    focused = false;
    summary: IvContent;
    caption: RowCaption;
    $content: IvContent;
}

export const grid = template(`(rowList:Row[]) => {
    <div focus()={focusOnLastFocusedRow()} tabindex="0"> # # </div> // todo: #firstFocusable
    
    for (let idx=0; rowList.length>idx; idx++) {
        let row = rowList[idx];

        <div class={getRowClass(row)}    // todo: support @class()
            ve="CfcExpandingRow"         // what for?
            cdkMonitorSubtreeFocus       // #expandingRowMainElement
            tabindex={row.expanded? '0' : '-1'} >

            if (!row.expanded) {
                // collapsed row: display summary
                <*rowSummary row={row} index={idx}/>
            } else {
                // expanded row: caption first
                <div class="cfc-expanding-row-details-caption" 
                    click()={handleCaptionClick(row)} 
                    style={"color:white;background-color:"+row.caption.color} 
                    @content={row.caption.$content}
                />
                // content
                <div class="cfc-expanding-row-details-content" @content={row.$content}/>
            }
        </div>
    }

    <div focus()={focusOnLastFocusedRow()} tabindex="0"> # # </div> // todo: #lastFocusable
}`);

function getRowClass(row: Row) {
    // this function should be removed when @class() is implemented
    let cls = ["cfc-expanding-row"];
    if (row.focused) cls.push("cfc-expanding-row-has-focus");
    if (row.expanded) cls.push("cfc-expanding-row-is-expanded");
    return cls.join(" ");
}

function handleCaptionClick(row: Row) {
    console.log("Caption click - row: "+row.id);
    row.expanded = !row.expanded;
}

function handleSummaryClick(row: Row) {
    console.log("Summary click - row: "+row.id);
    row.expanded = !row.expanded;
}

function isPreviouslyFocusedRow(idx) {
    // console.log("isPreviouslyFocusedRow")
    return false;
}

function handleFocus() {
    console.log("handleFocus")
}

function focusOnLastFocusedRow() {
    console.log("focusOnLastFocusedRow")
}

const rowSummary = template(`(row:Row, index:number) => {
    <div class="cfc-expanding-row-summary" tabindex="-1" // #expandingRowSummaryMainElement
        click()={handleSummaryClick(row)} focus()={handleFocus()}>
        <! @content={row.summary}/>
        
        <div class="cfc-expanding-row-accessibility-text"> #.# </div>
        <div class="cfc-expanding-row-accessibility-text"
            i18n="This is the label used to indicate that the user is in a list of expanding rows.">
            # Row {index + 1} in list of expanding rows. #
        </div>
        if (isPreviouslyFocusedRow(index)) {
            <div class="cfc-expanding-row-accessibility-text"
                i18n="This is the label used for the first row in list of expanding rows.">
                # Use arrow keys to navigate. #
            </div>
        }
    </div>
}`);