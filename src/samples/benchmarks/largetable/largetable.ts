import { htmlRenderer } from "../../../htmlrenderer";
import {bindAction, profile} from '../util';
import {buildTable, emptyTable} from './util';

let renderer;

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
  refresh(buildTable());
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
        <td style=("background-color:"+getColor(cell.row))>
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
bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));