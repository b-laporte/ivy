import { template, Controller, API } from '../../../iv';
import { tabs } from './tabset';

// @@extract: heavyComponent
@API class HeavyComponent {
    id: string;
}

@Controller class HeavyCptCtrl {
    $api: HeavyComponent;
    $init() {
        log("<div class='init'>init: heavyComponent " + this.$api.id + "</div>");
    }
    $beforeRender() {
        log("beforeRender: heavyComponent " + this.$api.id);
    }
    $afterRender() {
        log("afterRender: heavyComponent " + this.$api.id);
    }
}

const heavyComponent = template(`($:HeavyCptCtrl) => {
    log("render: heavyComponent " + $.$api.id);
    <div class="heavy">
        # heavy component '{$.$api.id}'#
    </>
}`);

// simple logger
let logs = "<div> Logs: </div>";
function log(msg: string) {
    logs += '<div>' + msg + '</div>';
    document.getElementById("logs")!.innerHTML = logs;
}

// @@extract: main
const main = template(`(tabSelection:string, $api) => {
    <div class="info">
        # Tab Selection: {tabSelection} #
    </>
    <*tabs selection={=$api.tabSelection}>
        <.tab id="tabA">
            <.title> # tab title # <b> # A # </></>
            <*heavyComponent id="cptA"/>
        </>
        <.tab id="tabB">
            <.title> # tab title # <b> # B # </></>
            <*heavyComponent id="cptB"/>
        </>
        <.tab id="tabC">
            <.title> # tab title # <b> # C # </></>
            <*heavyComponent id="cptC"/>
        </>
    </>
}`, tabs);

main().attach(document.getElementById("output")).render();
