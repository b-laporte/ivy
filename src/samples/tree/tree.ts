require('./index.html'); // webpack dependency
import { bindAction, profile } from '../benchmark_utils';
import { buildTree, emptyTree, TreeNode } from './util';
import { template } from '../../iv';

let tpl, data: TreeNode;

function refresh(data) {
  if (!tpl) {
    tpl = tree().attach(document.getElementById("root"));
  }
  tpl.refresh({ data: data });
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

const tree = template(`(data) => {
  <tree>
    <span style={"background-color:"+getColor(data.depth)}> #{data.value}# </span>
    if (data.left != null) {
      <*tree data={data.left}/>
    }
    if (data.right != null) {
      <*tree data={data.right}/>
    }
  </tree>
}`);

function noop() { }
bindAction('#destroyDom', destroyDom);
bindAction('#createDom', createDom);
bindAction('#detectChanges', detectChanges);
bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
bindAction('#detectChangesProfile', profile(detectChanges, noop, 'detectChanges'));
