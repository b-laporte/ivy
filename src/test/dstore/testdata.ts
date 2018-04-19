import { TestNodeDef } from './testdata';
import * as data from "../../dstore/dstore";

`
// simple test tree
<#TestNode xmlns="$dstore"> 
    <value @string/>
    <node @type({TestNode})/> // lazy creation: null by default - can't be mandatory here
    <node2 @type({TestNode})/>
</>
`

export let TestNode: data.DataNodeCfg<TestNodeDef> = new data.DataNodeCfgImpl<TestNodeDef>(function () { return new TestNodeImpl(); })

export interface TestNodeDef {
    value: string;
    node: TestNodeDef | null;
    node2: TestNodeDef | null;
}

class TestNodeImpl extends data.DataSet implements TestNodeDef {
    $_value = "";
    $__value = "";
    $_node: data.DataNode | null = null;
    $__node: data.DataNode | null = null;
    $_node2: data.DataNode | null = null;
    $__node2: data.DataNode | null = null;

    constructor(initDmd = true) {
        super(TestNode as any, initDmd);
    }

    get value() {
        return this.$_value;
    }
    set value(v) {
        data.setProp(this, "value", v);
    }

    get node() {
        return <TestNodeDef | null>this.$_node;
    }
    set node(v: TestNodeDef | null) {
        // todo check type / constructor
        data.setProp(this, "node", v, true);
    }

    get node2() {
        return <TestNodeDef | null>this.$_node2;
    }
    set node2(v: TestNodeDef | null) {
        // todo check type / constructor
        data.setProp(this, "node2", v, true);
    }

    $createNewVersion() {
        let ds = new TestNodeImpl(false);
        data.transferDmd(this, ds);
        this.$next = ds;

        ds.$_value = ds.$__value = this.$_value;
        this.$_value = this.$__value;
        this.$__value = ""; // set empty as will not be used any more (this will be sealed)

        ds.$_node = ds.$__node = data.setNewVersionRef(this.$_node, this, ds);
        this.$_node = this.$__node;
        this.$__node = null;

        ds.$_node2 = ds.$__node2 = data.setNewVersionRef(this.$_node2, this, ds);
        this.$_node2 = this.$__node2;
        this.$__node2 = null;
    }

    toString() {
        return "TestNodeImpl " + this.$_value;
    }
}

`
// simple node to test lists
<#ArrTestNode xmlns="$dstore"> 
    <name @string("no name")/> // default value is "no name"
    <list @list> // list of TestNode
        <@type({TestNode})/>
    </list>
</>
`

export let ArrTestNode: data.DataNodeCfg<ArrTestNodeDef> = new data.DataNodeCfgImpl<ArrTestNodeDef>(function () { return new ArrTestNodeImpl(); })

export interface ArrTestNodeDef {
    name: string;
    list: data.DataList<TestNodeDef>;
}

class ArrTestNodeListImpl extends data.DataListImpl<TestNodeImpl> {
    constructor(initDmd = true) {
        super(ArrTestNode as any, initDmd);
    }
    $newInstance(initDmd: boolean): data.DataListImpl<TestNodeImpl> {
        return new ArrTestNodeListImpl(initDmd);
    }
    $newItem(): TestNodeImpl {
        return new TestNodeImpl();
    }
}

class ArrTestNodeImpl extends data.DataSet implements ArrTestNodeDef {
    $_name = "no name"; // default value
    $__name = "no name";
    $_list: ArrTestNodeListImpl;
    $__list: ArrTestNodeListImpl | null;

    constructor(initDmd = true) {
        super(ArrTestNode as any, initDmd);
        data.initChildRef(this, new ArrTestNodeListImpl(), "list");
    }

    get name() {
        return this.$_name;
    }
    set name(v) {
        data.setProp(this, "name", v);
    }

    get list() {
        return this.$_list;
    }
    set list(v) {
        if (v) {
            data.setProp(this, "list", v, true);
        } else {
            // todo: warning/error
        }
    }

    $createNewVersion() {
        let ds = new ArrTestNodeImpl(false);
        data.transferDmd(this, ds);
        this.$next = ds;

        ds.$_name = ds.$__name = this.$_name;
        this.$_name = this.$__name;
        this.$__name = ""; // set empty as will not be used any more (this will be sealed)

        ds.$_list = ds.$__list = (data.setNewVersionRef(this.$_list, this, ds) as ArrTestNodeListImpl);
        this.$_list = this.$__list!;
        this.$__list = null;
    }
}

`
// node to test dependencies
<#4 xmlns="$dstore"> 
    <isNodeNull @boolean(true) @depends("/node")/> // true if node is null, false otherwise
    <node @type({TestNode})/> // lazy creation: null by default - can't be mandatory here
    <node2 @type({TestNode}) @depends("/node/node")/> // must refer to node.node or null if node is null
</>
`

export let DepNode: data.DataNodeCfg<DepNodeDef> = new data.DataNodeCfgImpl<DepNodeDef>(
    function () { return new DepNodeImpl(); },
    function (nd: DepNodeDef) {
        // getDependencies
        let res: any[][] = []; // res: (data.DataNode | string | null)[][] = [];
        res.push(["/isNodeNull", "isNodeNull", nd.node]);
        res.push(["/node2", "node2", (nd.node ? nd.node.node : null)]);
        return res;
    },
    function (nd: DepNodeDef) {
        // getSubLrNodes
        return <any[]>[ // (data.DataNode | null)[]
            nd.node,
            nd.node2
        ]
    }
);

export interface DepNodeDef {
    isNodeNull: boolean;
    node: TestNodeDef | null;
    node2: TestNodeDef | null;
}

class DepNodeImpl extends data.DataSet implements DepNodeDef {
    $_isNodeNull = true; 
    $__isNodeNull = true;
    $_node: data.DataNode | null = null;
    $__node: data.DataNode | null = null;
    $_node2: data.DataNode | null = null;
    $__node2: data.DataNode | null = null;

    constructor(initDmd = true) {
        super(DepNode as any, initDmd);
    }

    get isNodeNull() {
        return this.$_isNodeNull;
    }
    set isNodeNull(v) {
        data.setProp(this, "value", v);
    }

    get node() {
        return <TestNodeDef | null>this.$_node;
    }
    set node(v: TestNodeDef | null) {
        // todo check type / constructor
        data.setProp(this, "node", v, true);
    }

    get node2() {
        return <TestNodeDef | null>this.$_node2;
    }
    set node2(v: TestNodeDef | null) {
        // todo check type / constructor
        data.setProp(this, "node2", v, true);
    }

    $createNewVersion() {
        let ds = new DepNodeImpl(false);
        data.transferDmd(this, ds);
        this.$next = ds;

        ds.$_isNodeNull = ds.$__isNodeNull = this.$_isNodeNull;
        this.$_isNodeNull = this.$__isNodeNull = false;;
        this.$__isNodeNull = false; // set empty as will not be used any more (this will be sealed)

        ds.$_node = ds.$__node = data.setNewVersionRef(this.$_node, this, ds);
        this.$_node = this.$__node;
        this.$__node = null;

        ds.$_node2 = ds.$__node2 = data.setNewVersionRef(this.$_node2, this, ds);
        this.$_node2 = this.$__node2;
        this.$__node2 = null;
    }

    toString() {
        return "TestNodeImpl " + this.$_isNodeNull;
    }
}
