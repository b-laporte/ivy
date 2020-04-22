require('./index.html'); // webpack dependency
import { bindAction, profile } from '../benchmark_utils';
import { buildTable, emptyTable, TableCell } from './util';
import { $template } from '../../iv';

let tpl: any = undefined, data: TableCell[][];

function refresh(data) {
    if (tpl === undefined) {
        tpl = largeTable().attach(document.getElementById("root"));
    }
    tpl.render({ data: data });
}

function destroyDom() {
    refresh(emptyTable);
}

function createDom() {
    refresh(data = buildTable());
}

function detectChanges() {
    for (let i = 0; i < 10; i++) {
        refresh(data);
    }
}

function getColor(row: number) { return row % 2 ? '' : 'grey'; }

const largeTable = $template`(data) => {
    <table>
        <tbody>
        $for (let i = 0; i < data.length; i++) {
            $let row = data[i];
            <tr>
                $for (let j = 0; j < row.length; j++) {
                    $let cell = row[j];
                    <td style={"background-color:"+getColor(cell.row)}>
                        {cell.value}
                    </td>
                } 
            </tr>
        }   
        </tbody>
    </table>
}`;

function noop() { }

bindAction('#destroyDom', destroyDom);
bindAction('#createDom', createDom);
bindAction('#detectChanges', detectChanges);
bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));