
export let IvController = {};

/**
 * Type definition information
 */
class IvTypeDef {
    $isTypeDef;     // always true - to easily discriminate IvTypes from normal classes
    $lineNbr;       // line number where the type was defined (default: -1)
    $error;

    constructor() {
        this.$isTypeDef = true;
        this.$lineNbr = -1;
    }
}

/**
 * Specific type info for list attributes - e.g. optionList:Option[]
 */
class IvTypeList extends IvTypeDef {
    $isList;        // always true
    itemType;       // item type IvTypeDef (e.g. Option) or Generic class (e.g. String)
    itemName;       // string, item reference name (e.g. "option")

    constructor(itemType, itemName) {
        super();
        this.$isList = true;
        this.itemType = itemType;
        this.itemName = itemName;
    }
}

/**
 * Specific type info for list items - e.g. option in optionList:Option[]
 */
class IvTypeListItem extends IvTypeDef {
    $isListItem;    // always true
    itemType;       // item type IvTypeDef (e.g. Option) or Generic class (e.g. String)
    listName;       // string, item reference name (e.g. "optionList")

    constructor(itemType, listName) {
        super();
        this.$isListItem = true;
        this.itemType = itemType;
        this.listName = listName;
    }
}

/**
 * Specific type info for map types - e.g. <type #Select name:String optionList:Option[]/>
 */
export class IvTypeMap extends IvTypeDef {
    $isMap;             // always true
    $contentName;       // name of the attribute that should contain the node content - 0 if not supported
    $contentListName;   // name of the attribute that should contain the list of attribute nodes - 0 if not supported
    $listAttNames;
    $controllerName;    // attribute name corresponding to the controller
    $controllerClass;   // reference to the controller constructor function
    // other type info will be dynamically added as instance properties

    constructor() {
        super();
        this.$isMap = true
    }

    loadDefinition(lineNbr, simpleAtts, listAtts, contentName, contentListName) {
        this.$lineNbr = lineNbr;
        this.$contentName = contentName;
        this.$contentListName = contentListName;

        // simpleAtts is a list of name, value - note: is 0 if not defined
        if (simpleAtts) {
            let tp;
            for (let i = 0; simpleAtts.length > i; i += 2) {
                tp = simpleAtts[i + 1];
                if (tp.constructor === Array) {
                    if (tp[0] === IvController) {
                        if (tp[1].constructor !== Function) {
                            this.$error = "IvController type argument must be a class constructor";
                        } else if(this.$controllerClass) {
                            this.$error = "Controller can only be defined once";
                        } else if(tp.length>2) {
                            this.$error = "IvController should have only one argument";
                        } else {
                            this.$controllerName = simpleAtts[i];
                            this.$controllerClass = tp[1];
                        }
                    } else {
                        // todo
                    }
                } else {
                    this[simpleAtts[i]] = tp;
                }
            }
        }

        // listAtts is a list of listName, itemName, itemType - note: is 0 if not defined
        if (listAtts) {
            let listName, itemName, itemType;
            this.$listAttNames = [];
            // load the list attribute definitions
            for (let i = 0; listAtts.length > i; i += 3) {
                listName = listAtts[i];
                itemName = listAtts[i + 1];
                itemType = listAtts[i + 2];
                this.$listAttNames.push(listName);
                this[listName] = new IvTypeList(itemType, itemName);
                // register list items as direct child of the map to simplify data re-projection
                // when an item is found in the DOM
                this[itemName] = new IvTypeListItem(itemType, listName);
            }
        }
    }
}
