import { template } from "../../iv";
import { IvTemplate } from '../../iv/types';

require('./index.html');    // webpack dependency
require('./styles.css');    // webpack dependency
require('./award.svg');     // webpack dependency
require('./response.data'); // webpack dependency

let mainTemplate: IvTemplate;

window["renderFlexResults"] = function (elt, data, visible) {
    if (!mainTemplate) {
        mainTemplate = avail().attach(elt);
    }
    let p = mainTemplate.params;
    p.data = data;
    p.visible = visible;
    p.selectedItinerary = null;
    p.selectedFare = -1;
    mainTemplate.refresh();
    // if (!mainTemplate) {
    //     let body = doc.createElement("body");
    //     mainTemplate = avail();
    //     mainTemplate.document = doc;
    //     mainTemplate.attach(body)
    // }
    // let p = mainTemplate.params;
    // p.data = data;
    // p.visible = visible;
    // p.selectedItinerary = null;
    // p.selectedFare = -1;
    // mainTemplate.refresh();
}

const avail = template(`(data, selectedItinerary, selectedFare, visible) => {
    var availability = data.availability;
    if (visible) {
        <div class="container availability">
        let first=true;
        for (let bound of availability.bounds) {
            <div> // @async={first? 0 : 1}
                first=false;
                if (bound.searchData) {
                    <h2> #{bound.searchData.beginLocation.cityName} to {bound.searchData.endLocation.cityName}# </h2>
                }

                <div class="fare-families">
                    <$fareFamilyHeaders fareFamilies={availability.fareFamilies}/>
                </div>

                for (let itinerary of bound.itineraries) {
                    <$itineraryLine showFareDetails = {selectedItinerary===itinerary}
                        itinerary = {itinerary} 
                        selectedFare = {selectedFare}
                        fareFamiliesList = {availability.fareFamilies}
                        jqFareFamilies = {availability.jqFareFamilies} 
                        fareFamiliesCaveats = {availability.fareFamiliesCaveats}/>
                        // todo: select()="selectedItinerary = $event"
                }
            </div>
        }
        </div>
    }
}`);

const fareFamilyHeaders = template(`(fareFamilies) => {
    <div class="fare-family-names">
        for (let fareFamily of fareFamilies) {
            <h4> #{fareFamily.name}# </h4>
        }
        </div>

        <div class="fare-family-description">
        for (let fareFamily of fareFamilies) {
            <div> #{fareFamily.shortDescription}# </div>
        }
    </div>
}`);

const itineraryLine = template(`(itinerary, selectedFare, showFareDetails: boolean, fareFamiliesList, jqFareFamilies, fareFamiliesCaveats) => {
    <div class="itinerary">
        <div class="itinerary-header">
            <div class="itinerary-info right-delimiter">
                for (let segment of itinerary.segments) {
                    <$flightSummary 
                        departureAirport = {segment.beginLocation.cityName}
                        departureTime = {segment.beginDate} 
                        arrivalAirport = {segment.endLocation.cityName} 
                        arrivalTime = {segment.endDate} 
                        airline = {segment.airline}
                        flightNumber = {segment.flightNumber} 
                        flightDuration = {segment.duration}
                        nbrOfStops = 0 />  // todo: pass nbrOfStops ??
                }
                <strong class="total-duration"> #Total duration {itinerary.duration}# </strong>
            </div>

            for (let index=0;fareFamiliesList.length>index;index++) {
                let fare = fareFamiliesList[index], clsList="fare";
                if (fare.isMarginal) clsList += " fare-inactive";
                if (showFareDetails && selectedFare === index) clsList += " fare-selected";

                <div class={clsList} [style]={"border-color:" + fare.color} click()={toggleFareDetails(index,itinerary)}>
                    if (hasRecommendation(itinerary,fare)) {
                        if (itinerary.isJQOnlyFlight && !fare.isMarginal) {
                            <span>
                                <img alt="JetStar" src="https://book.qantas.com.au/go/2017.3-8/ffco/img/assets/jetstar_66px.png" width="66" height="18"/>
                                <div class="jq-fare-name"> #{jqFareFamilies[fare.code]? jqFareFamilies[fare.code].name : ""}# </div>
                            </span>
                        }
                        if (!(fare.isBusiness && !itinerary.flight.hasBusinessCabin)) {
                            <span class="fare-amount as-link">
                                if (fare.isMarginal) {
                                    <img src="./award.svg" width="24" height="24"/>
                                } else {
                                    #{amountForFare(itinerary,fare)}#
                                }
                            </span>
                        } else {
                            <span class="no-seats"> #N/A# </span>
                        }
                    } else {
                        <span class="no-seats"> #No seats# </span>
                    }

                    if (lastSeatsAvailable(itinerary, fare)) {
                        <div class="last-seats"> #5 or fewer seats# </div>
                    }
                </div>
            }
        </div>

        if (showFareDetails) {
            <$fareDetailGroup
                flight = {itinerary.flight} 
                selectedFare = {selectedFare} 
                fareFamilies = {fareFamiliesList} 
                jqFareFamilies = {jqFareFamilies} 
                fareFamiliesCaveats = {fareFamiliesCaveats} />
        }
    </div>
}`);

const flightSummary = template(`(departureAirport, departureTime, arrivalAirport, arrivalTime, airline, flightNumber, flightDuration, nbrOfStops) => {
    <div class="flight-summary">
        <header>
            <h3 class="flight-departure">
                <span>#{departureAirport}#</span> #{departureTime}#
            </h3>
            <h3 class="flight-departure">
                <span>#{arrivalAirport}#</span> #{arrivalTime}#
            </h3>
        </header>
        <footer>
            <div class="flight-number as-link with-icon" click()={flightDetails()}>
                <img class="icon" src={"https://book.qantas.com.au/go/2017.3-8/airlinesicons/"+airline.code.toLowerCase() + ".png"} 
                    width="14" height="14"/>
                #{airline.code.toUpperCase()}{flightNumber}#
            </div>
            <div class="flight-stops as-link"> #{nbrOfStops} stop(s)# </div>
            <div class="flight-duration"> #{flightDuration}# </div>
        </footer>
    </div>
}`);

const fareDetailGroup = template(`(flight, selectedFare, fareFamilies, jqFareFamilies, fareFamiliesCaveats) => {
    <div class="itinerary-details">
        <div class="avail-actions">
            <div class="action-desc">
                <img class="icon" src="https://book.qantas.com.au/go/2017.3-8/fare-conditions-icons/teaser-earnpoints.svg" /> 
                # Qantas Points earned #
            </div>
            <div class="action-desc">
                <img class="icon" src="https://book.qantas.com.au/go/2017.3-8/fare-conditions-icons/teaser-statuscredits.svg" /> 
                # Status Credits earned #
            </div>

            for (let rule of fareFamilies[0].teaserRules) {
                <div class="action-desc">
                    <img class="icon" src={"https://book.qantas.com.au/go/2017.3-8/fare-conditions-icons/teaser-"+rule.ruleId.toLowerCase()+".svg"} />
                    #{rule.label}#
                    if (fareFamiliesCaveats[rule.ruleId]) {
                        <sup> #{fareFamiliesCaveats[rule.ruleId][0]}# </sup>
                    }
                </div>
            }
        </div>

        for (let i=0;fareFamilies.length>i;i++) {
            let fare=fareFamilies[i];
            <$fareDetails fare={fare} recommendation={flight.listRecommendation[fare.code]} isSelected={selectedFare == i} />
        }
    </div>
}`);

const fareDetails = template(`(fare, recommendation, isSelected) => {
    isSelected = isSelected || false;
    let clsList="fare-flex fare-details";
    if (isSelected) clsList += " fare-selected";
    if (fare.isMarginal) clsList += " fare-marginal";

    <div class={clsList} style={"border-color:"+fare.color}>
        <div> #{getNoOfPoints(fare, recommendation)}# </div>
        <div> #{getStatusCredit(fare, recommendation)}# </div>

        for (let rule of fare.teaserRules) { 
            <div>
                if (!!rule.formattedValue) {
                    #{rule.formattedValue}#
                } else {
                    if (!!rule.booleanValue) {
                        <div class="rule-yes"> # v # </div> // &#x2714;
                    } else {
                        if (rule.booleanValue == null) {
                            # - #
                        } else {
                            <div class="rule-no"> # x # </div> // &#x2718;
                        }
                    }
                }
            </div>
        }
        <button class="btn-link full-fare"> # Full fare conditions # </button>
    </div>
}`);

function flightDetails() {
    alert("todo: flight details");
}

function getRecommendation(itinerary, fareCode) {
    return itinerary.flight.listRecommendation[fareCode];
}

function hasRecommendation(itinerary, fare) {
    return getRecommendation(itinerary, fare.code) !== undefined;
}

function amountForFare(itinerary, fare) {
    const recommendation = getRecommendation(itinerary, fare.code);
    return (recommendation) ? `$ ${Math.ceil(recommendation.amountForAll)}` : '';
}

function isFlightOperated(segments) {
    return filterOperatedSegments(segments).length > 0;
}

function filterOperatedSegments(segments) {
    return segments.filter(segment => segment.isOperated);
}

function lastSeatsAvailable(itinerary, fare) {
    const recommendation = getRecommendation(itinerary, fare.code);
    return !fare.isMarginal && recommendation && recommendation.showLSA;
}

function getNoOfPoints(fare, reco) {
    return getValueFromList(fare, reco, 'earnPointsAmountList');
}

function getStatusCredit(fare, reco) {
    return getValueFromList(fare, reco, 'statusCreditAmountList');
}

function getValueFromList(fare, reco, listName) {
    if (!fare.isMarginal && reco) {
        const value = reco[listName][0];
        return (value === 0 || value == null) ? '-' : `${value}`;
    }
    return '-';
}

function toggleFareDetails(idx, itinerary) {
    // todo: improve with no reference to mainTemplate instance
    let p = mainTemplate.params;
    if (p.selectedItinerary === itinerary && p.selectedFare === idx) {
        // hide
        p.selectedItinerary = null;
        p.selectedFare = -1;
    } else {
        // show
        p.selectedItinerary = itinerary;
        p.selectedFare = idx;
    }
    mainTemplate.refresh();
}

// ------------------------------------------------------------------------------------
// test doc
let UID_COUNT = 0;
const CR = "\n";

export const doc = {
    createDocFragment() {
        return new DocFragment();
    },

    createTextNode(data: string) {
        return new TextNode(data);
    },

    createElement(name: string) {
        return new ElementNode(name);
    },

    createElementNS(ns: string, name: string): any {
        return new ElementNode(name, ns);
    },

    createComment(data: string) {
        return new CommentNode(data);
    }
}

interface StringOptions {
    indent?: string;
    isRoot?: boolean;
    showUid?: boolean;
}


class CommentNode {
    $uid: string;

    constructor(public data: string) {
        this.$uid = "C" + (++UID_COUNT);
    }

    stringify(options: StringOptions): string {
        let indent = options.indent || "",
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.$uid : "";

        return `${indent}//${uid} ${this.data}`;
    }
}

class TextNode {
    $uid: string;
    parentNode = null;
    changeCount = 0;

    constructor(public _textContent: string) {
        this.$uid = "T" + (++UID_COUNT);
    }

    set textContent(v: string) {
        this._textContent = v;
        this.changeCount++;
    }

    stringify(options: StringOptions): string {
        let indent = options.indent || "",
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.$uid : "",
            chg = this.changeCount === 0 ? "" : " (" + this.changeCount + ")";

        return `${indent}#${uid}${this._textContent}#${chg}`;
    }
}

class ElementClassList {
    constructor(public elt: any) { }

    add(name: string) {
        if (!this.elt.className) {
            this.elt.className = name;
        } else {
            var arr = this.elt.className.split(" "), found = false;
            for (let i = 0; arr.length > i; i++) if (arr[i] === name) {
                found = true;
                break;
            }
            if (!found) {
                this.elt.className += (this.elt.className === "") ? name : (" " + name);
            }
        }
    }

    remove(name: string) {
        if (this.elt.className) {
            var arr = this.elt.className.split(" "), arr2: string[] = [];
            for (let i = 0; arr.length > i; i++) if (arr[i] !== name) {
                arr2.push(arr[i]);
            }
            this.elt.className = arr2.join(" ");
        }
    }
}

function incrementChanges(e, name) {
    if (e.$changes[name] === undefined) {
        e.$changes[name] = 0;
    } else {
        e.$changes[name]++;
    }
}

export class ElementNode {
    $uid: string;
    childNodes: any[] = [];
    namespaceURI: string = "http://www.w3.org/1999/xhtml";
    parentNode = null;
    classList: ElementClassList;
    style = {};
    $changes: any = {};
    eListeners: any[];

    constructor(public nodeName: string, namespace?: string) {
        this.$uid = ((nodeName === "#doc-fragment") ? "F" : "E") + (++UID_COUNT);
        if (namespace) {
            this.namespaceURI = namespace;
        }
        this.classList = new ElementClassList(this);
    }

    setAttribute(key: string, value: string) {
        let k = "a:" + key
        this[k] = value; // toUpperCase: to test that value has been set through setAttribute
        incrementChanges(this, k);
    }

    set className(v: string) {
        this["$className"] = v;
        incrementChanges(this, "$className");
    }

    appendChild(node) {
        if (!node) return;
        if (node.nodeName && node.nodeName === "#doc-fragment") {
            let ch = node.childNodes;
            for (let i = 0; ch.length > i; i++) {
                ch[i].parentNode = this;
            }
            this.childNodes = this.childNodes.concat(node.childNodes);
            node.childNodes = [];
        } else {
            this.childNodes.push(node);
            node.parentNode = this;
        }
    }

    removeChild(node) {
        // brute force... but simple and safe
        // console.log("removeChild", node.$uid)
        let ch2: any[] = [], found = false;
        for (let nd of this.childNodes) {
            if (nd !== node) {
                ch2.push(nd);
            } else {
                node.parentNode = null;
                found = true;
            }
        }
        if (!found) {
            throw "Failed to execute 'removeChild' on 'Node': Child not found";
        }
        this.childNodes = ch2;
    }

    set textContent(value) {
        if (value === "") {
            // remove all child nodes
            for (let i = 0; this.childNodes.length > i; i++) {
                this.childNodes[i].parentNode = null;
            }
            this.childNodes = [];
            //doc.traces.wentThroughTextContentDelete = true;
        } else {
            throw "Unsupported textContent: " + value;
        }
    }

    insertBefore(node, nodeRef) {
        // find nodeRef index
        let idx = -1;
        for (let i = 0; this.childNodes.length > i; i++) {
            if (nodeRef === this.childNodes[i]) {
                idx = i;
                break;
            }
        }
        if (idx < 0) {
            throw new Error("insertBefore: ref node not found");
        }
        if (!node) {
            throw new Error("insertBefore: invalid node");
        }
        if (node.nodeName && node.nodeName === "#doc-fragment") {
            let nch = node.childNodes;
            for (let i = nch.length - 1; i > -1; i--) {
                nch[i].parentNode = this;
                this.childNodes.splice(idx, 0, nch[i]);
            }
            node.childNodes = [];
        } else {
            node.parentNode = this;
            this.childNodes.splice(idx, 0, node);
        }
    }

    stringify(options: StringOptions): string {
        let indent = options.indent || "",
            isRoot = options.isRoot === true,
            showUid = options.showUid === true,
            uid = showUid ? "::" + this.$uid : "",
            styleBuf: string[] = [],
            lines: string[] = [], indent2 = isRoot ? indent + "    " : indent, atts: string[] = [], att = "";

        for (let k in this.style) {
            if (!this.style.hasOwnProperty(k)) continue;
            styleBuf.push(k + ":" + this.style[k]);
        }
        if (styleBuf.length) {
            atts.push('style="' + styleBuf.join(";") + '"');
        }

        for (let k in this) {
            if (this.hasOwnProperty(k) && k !== "nodeName" && k !== "childNodes"
                && k !== "namespaceURI" && k !== "$uid" && k !== "parentNode"
                && k !== "style" && k !== "classList" && k !== "$changes") {
                if (typeof this[k] === "function") {
                    atts.push(`on${k}=[function]`);
                } else {
                    let chge = "";
                    if (this.$changes[k]) {
                        chge = "(" + this.$changes[k] + ")";
                    }
                    if (k === "$className") {
                        atts.push(`className="${this[k]}"${chge}`);
                    } else {
                        atts.push(`${k}="${this[k]}"${chge}`);
                    }
                }
            }
        }
        if (atts.length) {
            att = " " + atts.join(" ");
        }

        if (this.childNodes.length) {
            let options2: StringOptions = { indent: indent2 + "    ", isRoot: false, showUid: showUid };
            lines.push(`${indent2}<${this.nodeName}${uid}${att}>`);
            for (let ch of this.childNodes) {
                lines.push(ch.stringify(options2));
            }
            lines.push(`${indent2}</${this.nodeName}>`);
        } else {
            lines.push(`${indent2}<${this.nodeName}${uid}${att}/>`);
        }

        if (isRoot) {
            return CR + lines.join(CR) + CR + indent;
        } else {
            return lines.join(CR);
        }
    }

    addEventListener(evtName, func) {
        if (!this.eListeners) {
            this.eListeners = [];
        }
        this.eListeners.push({ name: evtName, func: func });
    }

    click() {
        if (this.eListeners) {
            for (let listener of this.eListeners) {
                if (listener.name === "click") {
                    try {
                        let evt = { type: "click" };
                        listener.func(evt);
                    } catch (ex) {
                        console.log("ERROR in Event Listener: " + listener.name, ex);
                    }
                }
            }
        }
    }
}

class DocFragment extends ElementNode {
    constructor() {
        super("#doc-fragment");
    }
}