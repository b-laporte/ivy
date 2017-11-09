import { htmlRenderer } from "../../../htmlrenderer";
import {bindAction, profile} from '../util';
import {buildTable, emptyTable, TableCell} from './util';

let renderer;
let data: TableCell[][];

function refresh(data) {
  if (!renderer) {
    renderer = htmlRenderer(document.getElementById("root"), largeTable);
  }
  renderer.refresh({data: data});
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

function largeTable(data) {
 `---
  <table><tbody>
    % for (let i = 0; i < data.length; i++) {
      % const row = data[i];
      <tr>
      % for (let j = 0; j < row.length; j++) {
        % const cell = row[j];
        <td a:style=("background-color:"+getColor(cell.row))>
          {{cell.value}}
        </td>
      % } 
      </tr>
    % }   
  </tbody></table>
  ---`
}

function noop() {}

bindAction('#destroyDom', destroyDom);
bindAction('#createDom', createDom);
bindAction('#detectChanges', detectChanges);
bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));