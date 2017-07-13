import { VdRenderer } from "../../../iv";
import { htmlRenderer } from "../../../htmlrenderer";
import {bindAction, profile} from '../util';
import {buildTree, emptyTree} from './util';

let renderer;

function refresh(data) {
  if (!renderer) {
    renderer = htmlRenderer(document.getElementById("root"), tree);
  }
  renderer.refresh({data: data});
}

function destroyDom() {
  refresh(emptyTree);
}

function createDom() {
  refresh(buildTree());
}

function detectChanges() {
  for (let i = 0; i < 10; i++) {
    refresh(emptyTree);
  }
}

function getColor(row: number) { return row % 2 ? '' : 'grey'; }

function tree(r: VdRenderer, data) {
  `---
  <tree>
    <span style=("background-color:"+getColor(data.depth))>{{data.value}}</span>
    % if (data.right != null) {
      <c:tree [data]=data.right></c:tree>
    % }
    % if (data.right != null) {
      <c:tree [data]=data.left></c:tree>
    % }
  </tree>
  ---`
}

function noop() {}
bindAction('#destroyDom', destroyDom);
bindAction('#createDom', createDom);
bindAction('#detectChanges', detectChanges);
bindAction('#detectChangesProfile', profile(detectChanges, noop, 'detectChanges'));
bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));