import { assert, doc } from "./common";
import * as td from "./dstore/tododata";
import { isBeingChanged, processingDone, lastVersion, watch, unwatch, DataList } from "../dstore/dstore";
import { TestNode, TestNodeDef, ArrTestNodeDef, ArrTestNode, DepNode, DepNodeDef } from "./dstore/testdata";

describe('DStore', () => {

    it('should have correct init values', () => {
        let todo = td.Todo.create();
        assert.equal(todo.description, "", "init value string");
        assert.equal(todo.complete, false, "init value bool");
        assert.equal(isBeingChanged(todo), false, "initially pristine");
    });

    it('should handle changes on simple datasets', async function () {
        let todo = td.Todo.create();

        // mutate todo
        assert.equal(isBeingChanged(todo), false, "initially pristine");
        todo.complete = false;
        assert.equal(isBeingChanged(todo), false, "pristine unchanged");
        todo.complete = true;
        assert.equal(isBeingChanged(todo), true, "pristine changed");
        assert.equal(todo.complete, true, "new complete value");
        todo.description = "d1";
        assert.equal(todo.description, "d1", "new description value");

        let todo2 = await processingDone(todo);
        // find back initial values
        assert.equal(todo.complete, false, "new complete value 1-2");
        assert.equal(todo.description, "", "new description value 1-2");
        assert.equal(isBeingChanged(todo), false, "pristine again 1-2");

        // check new version values
        assert.equal(todo2.complete, true, "new complete value 2-2");
        assert.equal(todo2.description, "d1", "new description value 2-2");
        assert.equal(isBeingChanged(todo2), false, "pristine again 2-2");

        // last version
        assert.equal(lastVersion(todo), todo2, "last version");
    });

    it('should support child datasets', async function () {
        let node11 = TestNode.create();

        assert.equal(isBeingChanged(node11), false, "initially pristine");

        // check that new parent version is created when child node is set
        let node21 = TestNode.create();
        node11.node = node21;
        assert.equal(isBeingChanged(node21), false, "sub node pristine after assignment");
        assert.equal(isBeingChanged(node11), true, "not pristine 1");
        assert.equal((node11 as any).$next, null, "no next");

        let node12 = <TestNodeDef>await processingDone(node11);
        assert.equal(node11.node, null, "initial ref set to null");
        assert.equal(isBeingChanged(node12), false, "pristine 2");
        assert.equal(node12.node, node21, "new node value");
        assert.equal((node12 as any).$next, null, "no next 1");

        // check that new parent version is created when child changes
        node12.node!.value = "abc";
        let node13 = <TestNodeDef>await processingDone(node12);
        assert.equal((node13 as any).$next, null, "no next 2");
        assert.equal(node12 !== node13, true, "new root node 13");
        assert.equal(lastVersion(node12), node13, "new root node version");
        assert.equal(node12.node, node21, "node12.node back to original value");
        assert.equal(node12.node !== node13.node, true, "new sub node version");
        assert.equal(lastVersion(node12.node), node13.node, "new sub node version 2");
        assert.equal(node12.node ? node12.node.value : "x", "", "sub node reset");
        assert.equal(node13.node ? node13.node.value : "y", "abc", "new value in sub node");

        // check that child is processed before parent even if mutation is done is reverse order
        node13.value = "node13";
        node13.node!.value = "node2x";

        let node14 = <TestNodeDef>await processingDone(node13);
        assert.equal(isBeingChanged(node13), false, "node13 is pristine");
        assert.equal(node14.value, "node13", "node14 value");
        assert.equal(lastVersion(node13), node14, "new root node version node14");
        assert.equal(lastVersion(node13.node), node14.node, "new sub node version node14");
        assert.equal(node14.node ? node14.node.value : "x", "node2x", "node14.node value");
    });

    it('should correctly set value back after 2 consecutive changes', async function () {
        // null -> null       : nothing to do
        let node10 = TestNode.create();

        assert.equal(isBeingChanged(node10), false, "node10 is pristine");
        assert.equal(node10.value, "", "empty value");
        node10.value = "abc";
        node10.value = "def";
        assert.equal(node10.value, "def", "def value");

        let node11 = <TestNodeDef>await processingDone(node10);
        assert.equal(isBeingChanged(node10), false, "node11 is pristine");
        assert.equal(node10.value, "", "node11 value is back to empty string");
    });

    it('should properly update child refs: null->null', async function () {
        // null -> null       : nothing to do
        let node10 = TestNode.create();
        node10.node = null;
        assert.equal(isBeingChanged(node10), false, "node10 is pristine");

        let node11 = <TestNodeDef>await processingDone(node10);

        assert.equal(isBeingChanged(node11), false, "node11 is pristine");
        assert.equal(node10, node11, "unchanged");
    });

    it('should properly update child refs: null->sth', async function () {
        // null -> sth        : reference latest version of sth, add item to sth parents
        let node10 = TestNode.create(), node20 = TestNode.create();
        node20.value = "v2";
        node10.node = node20;
        let node11 = <TestNodeDef>await processingDone(node10);
        assert.equal(isBeingChanged(node11), false, "node11 is pristine");
        assert.equal(node11.node, lastVersion(node20), "ref latest version of child");

    });

    it('should properly update child refs: null->sth (2)', async function () {
        // null -> sth        : reference latest version of sth, add item to sth parents
        let node10 = TestNode.create(), node20 = TestNode.create();
        node10.node = node20;
        node20.value = "v2";
        let node11 = <TestNodeDef>await processingDone(node10);
        assert.equal(isBeingChanged(node11), false, "node11 is pristine");
        assert.equal(node11.node, lastVersion(node20), "ref latest version of child");

    });

    it('should properly update child refs: sth->sth', async function () {
        // sth -> sth         : no change, still reference the same item
        let node10 = TestNode.create(), node20 = TestNode.create();
        node20.value = "v2";
        node10.node = node20;
        let node11 = <TestNodeDef>await processingDone(node10), node21 = node11.node;

        assert.equal(isBeingChanged(node11), false, "node11 is pristine");
        node11.node = node21;
        assert.equal(isBeingChanged(node11), false, "node11 is still pristine");
        node11.node = null;
        assert.equal(isBeingChanged(node11), true, "node11 has changed");
        node11.node = node21;

        let node12 = <TestNodeDef>await processingDone(node11);
        assert.equal(node12, (node11 as any).$next, "node 12 is next node11");
        assert.equal(node12.node, node21, "node12 sub node hasn't changed");

    });

    it('should properly update child refs: sth->null', async function () {
        // sth -> null        : reference null, clean sth (remove current item from sth parents)
        let node10 = TestNode.create(), node20 = TestNode.create();
        node20.value = "v2";
        node10.node = node20;

        let node11 = <TestNodeDef>await processingDone(node10), node21 = lastVersion(node20);
        assert.equal((node21 as any).$dmd!.parents.length, 1, "node21 has one parent");
        assert.equal((node21 as any).$dmd!.parents[0], node11, "node21 parent is node11");
        node11.node = null;

        let node12 = <TestNodeDef>await processingDone(node11);
        assert.equal(node12, (node11 as any).$next, "node 12 is next node11");
        assert.equal(node12.node, null, "node12 sub node has been removed");

        assert.equal(lastVersion(node21), node21, "node21 didn't change");
        assert.equal((node21 as any).$dmd!.parents.length, 0, "node21 has no parents any more");
    });

    it('should properly update child refs: sth->null (2)', async function () {
        // sth -> null        : reference null, clean sth (remove current item from sth parents)
        let node10 = TestNode.create(), node20 = TestNode.create();
        node10.node = node20;
        node20.value = "v2";
        let node11 = <TestNodeDef>await processingDone(node10), node21 = lastVersion(node20);

        assert.equal((node21 as any).$dmd!.parents.length, 1, "node21 has one parent");
        assert.equal((node21 as any).$dmd!.parents[0], node11, "node21 parent is node11");
        node11.node = null;

        let node12 = <TestNodeDef>await processingDone(node11);
        assert.equal(node12, (node11 as any).$next, "node 12 is next node11");
        assert.equal(node12.node, null, "node12 sub node has been removed");

        assert.equal(lastVersion(node21), node21, "node21 didn't change");
        assert.equal((node21 as any).$dmd!.parents.length, 0, "node21 has no parents any more");
    });

    it('should properly update child refs: sth->sthElse unchanged', async function () {
        // sth -> sthElse     : reference sthElse, clean sth, add item to sthElse parents
        let node10 = TestNode.create(), node20 = TestNode.create(), node30 = TestNode.create();
        node10.value = "v1";
        node10.node = node20;
        node20.value = "v2";
        node30.value = "v3";

        let node11 = <TestNodeDef>await processingDone(node10), node21 = lastVersion(node20), node31 = lastVersion(node30);
        assert.equal((node21 as any).$dmd!.parents.length, 1, "node21 has one parent");
        assert.equal((node21 as any).$dmd!.parents[0], node11, "node21 parent is node11");
        assert.equal((node31 as any).$dmd!.parents.length, 0, "node31 has no parents");

        node11.node = node30; // will automatically reference the last version of node30

        let node12 = <TestNodeDef>await processingDone(node11);

        assert.equal((node21 as any).$dmd!.parents.length, 0, "node21 has no parents anymore");
        assert.equal((node31 as any).$dmd!.parents.length, 1, "node31 has one parent");
        assert.equal((node31 as any).$dmd!.parents[0], node12, "node31 parent is node12");
    });

    it('should properly update child refs: sth->sthElse changed', async function () {
        // sth -> sthElse     : reference sthElse, clean sth, add item to sthElse parents
        let node10 = TestNode.create(), node20 = TestNode.create(), node30 = TestNode.create();
        node10.value = "v1";
        node10.node = node20;
        node20.value = "v2";
        node30.value = "v3";

        let node11 = <TestNodeDef>await processingDone(node10), node21 = lastVersion(node20), node31 = lastVersion(node30);
        assert.equal((node21 as any).$dmd!.parents.length, 1, "node21 has one parent");
        assert.equal((node21 as any).$dmd!.parents[0], node11, "node21 parent is node11");
        assert.equal((node31 as any).$dmd!.parents.length, 0, "node31 has no parents");

        node31.value = "v3bis";
        node11.node = node31;

        let node12 = <TestNodeDef>await processingDone(node11), node32 = lastVersion(node30);

        assert.equal((node21 as any).$dmd!.parents.length, 0, "node21 has no parents anymore");
        assert.equal((node32 as any).$dmd!.parents.length, 1, "node32 has one parent");
        assert.equal((node32 as any).$dmd!.parents[0], node12, "node32 parent is node12");
    });

    it('should properly update child refs: sth->sthV2', async function () {
        // sth -> sthV2       : reference sthV2, clean sth, add item to sthV2 parents
        let node10 = TestNode.create(), node20 = TestNode.create();
        node10.node = node20;
        node20.value = "v2";

        let node11 = <TestNodeDef>await processingDone(node10);
        assert.equal(node10.node, null, "no node on original node10");
        assert.equal(node11.node!.value, "v2", "new v2 value");

        node11.node!.value = "v21";
        let node12 = <TestNodeDef>await processingDone(node11);
        assert.equal(node11.node!.value, "v2", "v2 value on node11");
        assert.equal(node12.node!.value, "v21", "v21 value on node12");

        debugger
        // change, set to null and set back
        node12.node!.value = "v22";
        let n = node12.node;
        node12.node = null;
        node12.node = n;

        let node13 = <TestNodeDef>await processingDone(node12);
        assert.equal(node12.node!.value, "v21", "still v21 value on node12");
        assert.equal(node13.node!.value, "v22", "v22 value on node13");
    });

    it('should properly update 2 refs to the same child', async function () {
        // sth -> sthV2       : reference sthV2, clean sth, add item to sthV2 parents
        let node10 = TestNode.create(), node20 = TestNode.create();
        node10.node = node20;
        node20.value = "v2";
        node10.node2 = node20;

        assert.equal((node20 as any).$dmd!.parents.length, 2, "parent is referenced twice");
        let node11 = await processingDone(node10) as TestNodeDef;
        assert.equal(node10.node, null, "node10 reset to original value");
        assert.equal(node11.node!.value, "v2", "node value updated");
        assert.equal(node11.node2!.value, "v2", "node2 value updated");

        node11.node2!.value = "v3";
        let node12 = await processingDone(node11) as TestNodeDef;
        assert.equal(node11.node!.value, "v2", "node value v2");
        assert.equal(node11.node2!.value, "v2", "node2 value v2");
        assert.equal(node12.node!.value, "v3", "node value v3");
        assert.equal(node12.node2!.value, "v3", "node2 value v3");
        assert.equal((node12.node2! as any).$dmd!.parents.length, 2, "node2 parent is referenced twice");

        node12.node!.value = "v4";
        node12.node = null;
        let node13 = <TestNodeDef>await processingDone(node12);
        assert.equal((node13.node2! as any).$dmd!.parents.length, 1, "node2 parent is now referenced once");
        assert.equal(node13.node2!.value, "v4", "node2 value v4");

        node13.node2 = null;
        let node14 = <TestNodeDef>await processingDone(node13), node24 = lastVersion(node20);
        assert.equal((node24 as any).$dmd!.parents.length, 0, "node24 parent list is now empty");
        assert.equal(node24.value, "v4", "node24 value is v4");
    });

    it('should properly update data lists: nothing -> sthV2 -> sthV3 -> null -> null', async function () {
        let node10 = ArrTestNode.create();

        assert.equal(isBeingChanged(node10), false, "node10 unchanged");
        let itemA = node10.list.newItem();
        itemA.value = "A";

        assert.equal(isBeingChanged(node10), true, "node10 changed");
        let node11 = <ArrTestNodeDef>await processingDone(node10);
        assert.equal(isBeingChanged(node11), false, "node11 unchanged");
        assert.equal(node11.list.get(0)!.value, "A", "list.get(0).value is A");
        assert.equal(lastVersion(node10.list), node11.list, "node11.list is last version of node10.list");
        assert.equal(node10.list.length, 0, "node10.list has been reset to empty list");
        assert.equal(node11.list.length, 1, "node11.list has only one item");

        node11.list.get(0)!.value = "A2";
        let node12 = <ArrTestNodeDef>await processingDone(node11);
        assert.equal(node11.list.get(0)!.value, "A", "list.get(0).value is back to A");
        assert.equal(node12.list.get(0)!.value, "A2", "list.get(0).value is now A2");

        node12.list.set(0, null);
        let node13 = <ArrTestNodeDef>await processingDone(node12);
        assert.equal(node12.list.get(0)!.value, "A2", "list.get(0).value is back to A2");
        assert.equal(node13.list.get(0), null, "node13 list[0] is now null");
        assert.equal(node13.list.length, 1, "node13 list.length is still 1");

        node13.list.set(0, null);
        assert.equal(isBeingChanged(node13), false, "node13 unchanged");
        let node14 = <ArrTestNodeDef>await processingDone(node13);
        assert.equal(node14, node13, "no change on node14");
    });

    it('should support DataList.splice', async function () {
        function stringifyList(list) {
            let arr: string[] = [];
            for (let i = 0; list.length > i; i++) {
                itm = list.get(i)!;
                arr.push(itm ? itm.value : "null");
            }
            return arr.join("-");
        }

        let node10 = ArrTestNode.create(), list = node10.list, itm = list.newItem();
        itm.value = "i1";
        itm = list.newItem();
        itm.value = "i2";
        itm = list.newItem(3);
        itm.value = "i4";

        let node11 = <ArrTestNodeDef>await processingDone(node10);
        assert.equal(stringifyList(node11.list), "i1-i2-null-i4", "list original content");
        assert.equal(isBeingChanged(node11), false, "no change on node11");

        node11.list.splice(1, 2);
        assert.equal(isBeingChanged(node11), true, "splice changed node11");

        let node12 = <ArrTestNodeDef>await processingDone(node11);
        assert.equal(stringifyList(node11.list), "i1-i2-null-i4", "node11.list original content");
        assert.equal(stringifyList(node12.list), "i1-i4", "node12.list new content");
        assert.equal(lastVersion(node11.list), node12.list, "lastVersion of node11.list is node12.list");

        node12.list.splice(1, 0, list.newItem(-1)); // insert a new item
        let node13 = <ArrTestNodeDef>await processingDone(node12);
        assert.equal(stringifyList(node13.list), "i1--i4", "node13.list content");
    });

    function initNewArrTestNode() {
        let node10 = ArrTestNode.create(), list = node10.list, itm = list.newItem();
        itm.value = "i1";
        itm = list.newItem();
        itm.value = "i2";
        itm = list.newItem();
        itm.value = "i3";
        return node10;
    }

    it('should support DataList.forEach', async function () {
        let node10 = initNewArrTestNode();
        let node11 = <ArrTestNodeDef>await processingDone(node10), arr: string[] = [];

        node11.list.forEach((value, index, dList) => {
            arr.push(value.value + "/" + index);
            assert.equal(dList, node11.list, "list is dList");
        });
        assert.equal(arr.join("-"), "i1/0-i2/1-i3/2", "forEach result");
        assert.equal(isBeingChanged(node11), false, "node11 is unchanged");

        let o = {
            count: 0,
            increment() {
                this.count++;
            }
        }

        node11.list.forEach(o.increment, o);
        assert.equal(o.count, 3, "forEach result with thisArg");
        assert.equal(isBeingChanged(node11), false, "node11 is unchanged");
    });

    it('should support DataList.filter', async function () {
        let node10 = initNewArrTestNode();
        let node11 = <ArrTestNodeDef>await processingDone(node10);

        let ls = node11.list.filter((item: TestNodeDef, index) => {
            return (item.value === "i1") || (index === 2);
        });
        let ls11 = node11.list;

        assert.equal(isBeingChanged(ls), false, "ls is unchanged");
        assert.equal((ls as any).$dmd !== null, true, "ls has dmd");
        assert.equal(ls.toString(), "TestNodeImpl i1,TestNodeImpl i3", "ls content");
        assert.equal((ls as any).$dmd.parents.length, 0, "ls has no parents");
        assert.equal((ls11 as any).$dmd.parents.length, 1, "ls11 has one parent");
        assert.equal((ls.get(0) as any).$dmd.parents.length, 2, "list items have now 2 parents");

        node11.list = ls;

        assert.equal(isBeingChanged(node11), true, "node11 is changed");
        let node12 = <ArrTestNodeDef>await processingDone(node11);

        assert.equal(node12.list.toString(), "TestNodeImpl i1,TestNodeImpl i3", "ls content");
        assert.equal((ls11 as any).$dmd.parents.length, 0, "ls11 has no more parents");
        assert.equal((ls as any).$dmd.parents.length, 1, "ls has one parent");
        assert.equal((ls as any).$dmd.parents[0], node12, "node12 is ls parent");
    });

    it('should support DataList.indexOf', async function () {
        let node10 = initNewArrTestNode();
        let node11 = <ArrTestNodeDef>await processingDone(node10);

        let itm1 = node11.list!.get(1);

        assert.equal(node11.list!.indexOf(itm1), 1, "itm1 index is 1");
    });

    it('should support processors', async function () {
        let processorCalls = 0;

        DepNode.setProcessor("/isNodeNull", function (node: TestNodeDef) {
            // we should return the new value
            processorCalls++;
            return (node === null);
        })

        let dn10 = DepNode.create(), tn10 = TestNode.create();

        assert.equal(isBeingChanged(dn10), false, "new dn10 is not being changed");
        assert.equal(processorCalls, 0, "0 processor calls");
        assert.equal(dn10.isNodeNull, true, "node is null: init value");

        dn10.node = tn10;

        assert.equal(isBeingChanged(dn10), true, "dn10 is being changed");
        assert.equal(processorCalls, 0, "0 processor calls");
        assert.equal(dn10.isNodeNull, true, "node is null (processors not run yet)");

        let dn11 = <DepNodeDef>await processingDone(dn10);
        assert.equal(processorCalls, 1, "1 processor call");
        assert.equal(dn11.isNodeNull, false, "dn11 node is not null");

        dn11.node = null;

        let dn12 = <DepNodeDef>await processingDone(dn11);
        assert.equal(processorCalls, 2, "2 processor calls");
        assert.equal(dn11.isNodeNull, false, "dn11 node is not null (back to previous value)");
        assert.equal(dn12.isNodeNull, true, "dn12 node is now null");

        DepNode.setProcessor("/isNodeNull", null);
        dn12.node = tn10;

        let dn13 = <DepNodeDef>await processingDone(dn12);
        assert.equal(processorCalls, 2, "2 processor calls - unchanged as processor has been removed");
        assert.equal(dn13.isNodeNull, true, "dn13 node is still null");

    });

    it('should support watchers', async function () {
        let node = initNewArrTestNode(), watcherCalls = 0;

        let watchRef = watch(node, (newNode) => {
            watcherCalls++;
            node = newNode;
        });

        await processingDone(node);

        assert.equal(watcherCalls, 1, "1 watcher call");
        assert.equal(node.list!.length, 3, "3 items in the node list");
        assert.equal(node.name, "no name", "node name is no name");

        node.name = "ABC";
        node.list!.newItem().value = "last item";

        await processingDone(node);

        assert.equal(watcherCalls, 2, "2 watcher calls");
        assert.equal(node.list!.length, 4, "4 items in the node list");
        assert.equal(node.name, "ABC", "node name is ABC");

        unwatch(node, watchRef);

        node.name = "ABC2";

        node = await processingDone(node);

        assert.equal(watcherCalls, 2, "still 2 watcher calls");
        assert.equal(node.list!.length, 4, "4 items in the node list");
        assert.equal(node.name, "ABC2", "node name is now ABC2");
    });

    // data lists of primitive types
    // init


    // DataList: todo
    // set to null = empty array
    // set/unset array (like for a ref)
    // mutations: pop, push, reverse, shift, slice, sort, splice, unshift, addItem(position) - copyWithin, fill could be unsupported
    //    -> cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype
    // array item change
    // null -> null
    // null -> primitive type (string, number, boolean)
    // null -> sth changed
    // null -> sth unchanged
    // primitive type -> null
    // primitive type -> same primitive value
    // primitive type -> another primitive value
    // sth -> null
    // sth -> sthElse unchanged
    // sth -> sthElse changed
    // sth -> sthV2

    // later: maps
    // ->> possibility to extend some data structures? (customization)

    // TODO raise error when setting an invalid processor on an object

    td.TodoApp.setProcessor("/itemsLeft", function (list: DataList<td.TodoData>) {
        let itemsLeft = 0;
        list.forEach(item => {
            itemsLeft += item.complete ? 0 : 1;
        });
        return itemsLeft;
    });

    td.TodoApp.setProcessor("/listView", function (filter: string, list: DataList<td.TodoData>) {
        if (filter === "ALL") {
            return list;
        } else {
            let isComplete = (filter === "COMPLETED");
            return list.filter(item => item.complete === isComplete);
        }
    });

    it('should work for TodoMVC', async function () {
        let watchCalls = 0,
            todoApp = td.TodoApp.create();

        let wRef = watch(todoApp, (app: td.TodoAppData) => {
            watchCalls++;
            todoApp = app;
        });

        await processingDone(todoApp);
        assert.equal(watchCalls, 1, "1 watch call");
        assert.equal(todoApp.list.length, 0, "no items at init");
        assert.equal(todoApp.itemsLeft, 0, "0 items left");
        
        // add a first item
        let item= todoApp.list.newItem();
        item.description = "item A";
        
        await processingDone(todoApp);
        assert.equal(watchCalls, 2, "2 watch calls");
        assert.equal(todoApp.list.length, 1, "1 item in list");
        assert.equal(todoApp.itemsLeft, 1, "1 item left");
        assert.equal(todoApp.list.get(0)!.description, "item A", "list.get(0) = item A");
        assert.equal(todoApp.listView.get(0)!.description, "item A", "listView.get(0) = item A");
        //assert.equal((todoApp.list as any).$dmd!.parents.length, 2, "todoApp list has 2 parents");

        debugger
        // add a 2nd item
        item= todoApp.list.newItem();
        item.description = "item B";
        debugger
        
        await processingDone(todoApp);
        assert.equal(watchCalls, 3, "3 watch calls");
        debugger
        assert.equal(todoApp.list.length, 2, "2 items in list - 3");
        assert.equal(todoApp.itemsLeft, 2, "2 items left - 3");
        assert.equal(todoApp.list.get(1)!.description, "item B", "list.get(1) = item B - 3");
        assert.equal(todoApp.listView.get(1)!.description, "item B", "listView.get(1) = item B - 3");

        // set first item complete
        todoApp.list.get(0)!.complete = true;

        await processingDone(todoApp);
        assert.equal(watchCalls, 4, "4 watch calls");
        assert.equal(todoApp.list.length, 2, "2 items in list - 4");
        assert.equal(todoApp.itemsLeft, 1, "1 item left - 4");

        // delete first item
        todoApp.list.splice(0,1);

        await processingDone(todoApp);
        assert.equal(watchCalls, 5, "5 watch calls");
        assert.equal(todoApp.list.length, 1, "1 item in list - 5");
        assert.equal(todoApp.itemsLeft, 1, "1 item left - 5");
        assert.equal(todoApp.list.get(0)!.description, "item B", "list.get(0) = item B - 5");
        assert.equal(todoApp.listView.get(0)!.description, "item B", "listView.get(0) = item B - 5");

        unwatch(todoApp, wRef);
    });


    // typical issue
    // processor not called -> is it register on the right object (-> raise error if object doesn't accept a certain processor)
    // processor does a bad job in some cases -> support conditional debugging (how?)
});