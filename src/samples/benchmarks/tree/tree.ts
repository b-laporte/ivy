import { htmlRenderer } from "../../../htmlrenderer";
import {bindAction, profile} from '../util';
import {buildTree, emptyTree, TreeNode} from './util';

let renderer;
let data: TreeNode;

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
  refresh(data = buildTree());
}

function detectChanges() {
  for (let i = 0; i < 10; i++) {
    refresh(data);
  }
}

function getColor(row: number) { return row % 2 ? '' : 'grey'; }

function tree(data) {
  `---
  <tree>
    <span a:style=("background-color:"+getColor(data.depth))>{{data.value}}</span>
    % if (data.left != null) {
      <c:tree [data]=data.left></c:tree>
    % }
    % if (data.right != null) {
      <c:tree [data]=data.right></c:tree>
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