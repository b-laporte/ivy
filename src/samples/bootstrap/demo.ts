import { htmlRenderer } from "../../htmlrenderer";
import { tabset } from "./tabset";
import { pagination } from "./pagination";

function demo(name) {
    `---
    <div a:class="demo">
        <div a:class="jumbotron">
            <h2>{{name}} demo</h2>
        </div>
        <div a:class="card-body">
            <c:tabset destroyOnHide=false>
                <:tab title="Simple">
                    <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
                    master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
                    dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
                    iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>

                    <h5> Simple pagination samples </h5>
                    <c:pagination collectionSize=70 page=2 directionLinks=true a:aria-label="Default pagination"/>
                    <c:pagination collectionSize=70 page=2 directionLinks=false/>
                    <c:pagination collectionSize=70 page=2 boundaryLinks=true/>
                </:tab>
                <:tab>
                    <:title> <b> Advanced </b> <i> title </i> </:title>
                    Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid.
                    <p>Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table
                    craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl
                    cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia
                    yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean
                    shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero
                    sint qui sapiente accusamus tattooed echo park.</p>

                    <h5> Advanced pagination samples </h5>
                    <c:pagination collectionSize=120 page=2 maxSize=5 rotate=false ellipses=false size="lg" directionLinks=true />
                    <c:pagination collectionSize=120 page=2 maxSize=5 rotate=true boundaryLinks=true/>

                    <h5> Customized sample </h5>
                    <c:pagination collectionSize=120 page=3 maxSize=5 boundaryLinks=true directionLinks=true 
                        pageTemplate=customPageCell navTemplate=customNavCell/>
                </:tab>
                <:tab title="Disabled" disabled=true>
                    <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
                    master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
                    dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
                    iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
                </:tab>
                <:tab title="Dynamic" contentTemplate=dynamicTab/>
            </c:tabset>
        </div>
    </div>
     ---`
}

function customPageCell(pageNumber, ellipsis, isCurrentPage, action) {
    `---
    % if (ellipsis) {
        <a a:class="page-link"> - </a>
    % } else {
        <a a:class="page-link" a:href="" [a:style]=getStyle(pageNumber, isCurrentPage) onclick(e)=action(e)>
            {{pageNumber}}
            % if (isCurrentPage) {
                <span a:class="sr-only">(current)</span>
            % }
        </a>
    % }
    ---`
}

function getStyle(pageNumber, isCurrentPage) {
    let colors = ["#3d82", "#ec412c", "#fcbd02", "#3d82", "#2ca94f", "#ec412c"], 
        color=colors[pageNumber % colors.length];
    if (isCurrentPage) {
        return `color:white;background-color:${color}`;
    } else {
        return `color:${color};background-color:white`;
    }
}


function customNavCell(type, disabled, setTabIndex, action) {
    `---
    <li a:class="page-item" [classList.disabled]=disabled>
        <a a:aria-label=type a:class="page-link" a:href="" onclick(e)=action(e) 
            [a:tabindex]=(setTabIndex ? null : '-1')>
            % if (type === "Previous" || type === "Next") {
                {{type.toLowerCase()}}
            % } else if (type === "First") {
                \\u00AB\\u00AB
            % } else if (type === "Last") {
                \\u00BB\\u00BB
            % }
        </a>
    </li>
    ---`
}

function dynamicTab() {
    `---
    <p> The content of this tab has been generated on-demand </p>
    <h5> Some sample </h5>
    <c:pagination collectionSize=90 page=3 directionLinks=true/>
    ---`
}

let r = htmlRenderer(document.getElementById("main"), demo);
r.refresh({ name: "Bootstrap" });
