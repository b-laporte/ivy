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
                    <*fareFamilyHeaders fareFamilies={availability.fareFamilies}/>
                </div>

                for (let itinerary of bound.itineraries) {
                    <*itineraryLine showFareDetails = {selectedItinerary===itinerary}
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
                    <*flightSummary 
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
            <*fareDetailGroup
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
            <*fareDetails fare={fare} recommendation={flight.listRecommendation[fare.code]} isSelected={selectedFare == i} />
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