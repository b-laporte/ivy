import { iv } from '../../src/iv/iv';
import { render } from '../../src/iv/htmlrenderer';

/* global document, ENV, Monitoring */

var pkg = iv`
    <function #avail data>
        % var availability=data.availability
        <div class="container availability">

        % for (bound of availability.bounds) {
            <div>
                % if (bound.searchData) {
                    <h2>{{bound.searchData.beginLocation.cityName}} to {{bound.searchData.endLocation.cityName}}</h2>
                % }

                <div class="fare-families">
                    <fareFamilyHeaders [fareFamilies]=availability.fareFamilies/>
                </div>

                % for (let itinerary of bound.itineraries) {
                    <itineraryLine [showFareDetails]=false  
                        [itinerary]=itinerary 
                        [fareFamiliesList]=availability.fareFamilies 
                        [jqFareFamilies]=availability.jqFareFamilies 
                        [fareFamiliesCaveats]=availability.fareFamiliesCaveats />

                        // [showFareDetails]=(selectedItinerary===itinerary) 
                        // todo: (onSelect)="selectedItinerary = $event"
                % }
            </div>
        % }
        </div>
    </function>

    <function #fareFamilyHeaders fareFamilies>
        <div class="fare-family-names">
        % for (let fareFamily of fareFamilies) {
            <h4> {{fareFamily.name}} </h4>
        % }
        </div>

        <div class="fare-family-description">
        % for (let fareFamily of fareFamilies) {
            <div> {{fareFamily.shortDescription}} </div>
        % }
        </div>
    </function>

    <function #itineraryLine itinerary showFareDetails:Boolean fareFamiliesList jqFareFamilies fareFamiliesCaveats>

        <div class="itinerary">
            <div class="itinerary-header">
                <div class="itinerary-info right-delimiter">
                    % for (let segment of itinerary.segments) {
                        // todo: pass nbrOfStops ??
                        <flightSummary 
                            [departureAirport]=segment.beginLocation.cityName 
                            [departureTime]=segment.beginDate 
                            [arrivalAirport]=segment.endLocation.cityName 
                            [arrivalTime]=segment.endDate 
                            [airline]=segment.airline
                            [flightNumber]=segment.flightNumber 
                            [flightDuration]=segment.duration />
                    % }
                    <strong class="total-duration">Total duration {{itinerary.duration}}</strong>
                </div>

                % for (let index=0;fareFamiliesList.length>index;index++) {
                    % let fare = fareFamiliesList[index];
                    <div class="fare"  
                        onclick()=toggleFareDetails(index) style=("border-color:"+fare.color) > 
                        // todo: use $index instead (when available)
                        // todo: support classs list class=("fare"+fare.isMarginal?" fare-inactive":""+(showFareDetails && activeSelectedFare == i)?" fare-selected":"")
                        // todo: [style.border-color]="fare.color">

                        % if (${hasRecommendation}(itinerary,fare)) {
                            % if (itinerary.isJQOnlyFlight && !fare.isMarginal) {
                                <span>
                                    <img alt="JetStar" src="https://book.qantas.com.au/go/2017.3-8/ffco/img/assets/jetstar_66px.png" width="66" height="18"/>
                                    <div class="jq-fare-name">{{jqFareFamilies[fare.code]? jqFareFamilies[fare.code].name : ""}}</div>
                                </span>
                            % }
                            % if (!(fare.isBusiness && !itinerary.flight.hasBusinessCabin)) {
                                <span class="fare-amount as-link">
                                    % if (fare.isMarginal) {
                                        <img src="./assets/award.svg" width="24" height="24"/>
                                    % } else {
                                        {{${amountForFare}(itinerary,fare)}}
                                    % }
                                </span>
                            % } else {
                                <span class="no-seats">N/A</span>
                            % }
                        % } else {
                            <span class="no-seats">No seats</span>
                        % }

                        % if (${lastSeatsAvailable}(itinerary, fare)) {
                            <div class="last-seats">5 or fewer seats</div>
                        % }
                    </div>
                % }
            </div>

            % if (showFareDetails) {
                <fareDetailGroup
                    [flight]=itinerary.flight 
                    [selectedFare]=activeSelectedFare 
                    [fareFamilies]=fareFamiliesList 
                    [jqFareFamilies]=jqFareFamilies 
                    [fareFamiliesCaveats]=fareFamiliesCaveats />
            % }
        </div>

    </function>

    <function #flightSummary departureAirport departureTime arrivalAirport arrivalTime airline flightNumber flightDuration nbrOfStops=0>
        <div class="flight-summary">
            <header>
                <h3 class="flight-departure">
                <span>{{departureAirport}}</span> {{departureTime}}
                </h3>
                <h3 class="flight-departure">
                <span>{{arrivalAirport}}</span> {{arrivalTime}}
                </h3>
            </header>
            <footer>
                <div class="flight-number as-link with-icon" onclick()=flightDetails()>
                    <img class="icon" src=("https://book.qantas.com.au/go/2017.3-8/airlinesicons/"+airline.code.toLowerCase()+".png") width="14" height="14"/>
                    {{airline.code.toUpperCase()}}{{flightNumber}}
                </div>
                <div class="flight-stops as-link">{{nbrOfStops}} stop(s)</div>
                <div class="flight-duration">{{flightDuration}}</div>
            </footer>
        </div>
    </function>

    <function #fareDetailGroup flight selectedFare fareFamilies jqFareFamilies fareFamiliesCaveats>
        <div class="itinerary-details">
            <div class="avail-actions">

                <div class="action-desc">
                    <img class="icon" src="https://book.qantas.com.au/go/2017.3-8/fare-conditions-icons/teaser-earnpoints.svg" /> Qantas
                    Points earned
                </div>
                <div class="action-desc">
                    <img class="icon" src="https://book.qantas.com.au/go/2017.3-8/fare-conditions-icons/teaser-statuscredits.svg" /> Status
                    Credits earned
                </div>

                % for (let rule of fareFamilies[0].teaserRules) {
                    <div class="action-desc">
                        //todo <img class="icon" src="https://book.qantas.com.au/go/2017.3-8/fare-conditions-icons/teaser-{{rule.ruleId.toLowerCase()}}.svg" />
                        {{rule.label}}
                        //todo <sup *ngIf="fareFamiliesCaveats[rule.ruleId]">{{fareFamiliesCaveats[rule.ruleId][0]}}</sup>
                    </div>
                % }
            </div>

            // <app-fare-details
            //     *ngFor="let fare of fareFamilies; let i = index"

            //     class="fare-flex fare-details"
            //     [class.fare-selected]="selectedFare == i"
            //     [class.fare-marginal]="fare.isMarginal"
            //     [style.border-color]="fare.color"
            //         [fare]="fare"
            //     [recommendation]="flight.listRecommendation[fare.code]"
            // >
            // </app-fare-details>

        </div>
    </function>
`;

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
    return (recommendation && recommendation.priceForAll) ? `$${Math.ceil(recommendation.priceForAll.totalAmount)}` : '';
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

window.startRendering = function (data) {
    var view = render(pkg.avail, document.getElementById("app"), { data: data });
}

