/**
 * Type definition information
 */
class IvTypeDef {
    $isTypeDef;     // always true - to easily discriminate IvTypes from normal classes
    $lineNbr;       // line number where the type was defined (default: -1)

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
    // other type info will be dynamically added as instance properties

    constructor() {
        super();
        this.$isMap = true;
        this.$contentName = 0;
        this.$contentListName = 0;
        this.$listAttNames = 0;
    }

    loadDefinition(lineNbr, simpleAtts, listAtts, contentName, contentListName) {
        this.$lineNbr = lineNbr;
        this.$contentName = contentName;
        this.$contentListName = contentListName;

        // simpleAtts is a list of name, value - note: is 0 if not defined
        if (simpleAtts) {
            for (let i = 0; simpleAtts.length > i; i += 2) {
                this[simpleAtts[i]] = simpleAtts[i + 1];
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
