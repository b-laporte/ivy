import { $template, Controller, API } from '../../../iv';
import { tabs } from './tabset';

// @@extract: heavyComponent
@API class HeavyComponent {
    id: string;
}

@Controller class HeavyCptCtrl {
    $api: HeavyComponent;
    $init() {
        log("<span class='init'>init: " + this.$api.id + "</span>");
    }
    $beforeRender() {
        log("beforeRender: " + this.$api.id);
    }
    $afterRender() {
        log("afterRender: " + this.$api.id);
    }
}

const heavyComponent = $template`($:HeavyCptCtrl) => {
    $exec log("render: " + $.$api.id);
    <div class="heavy">
        heavy component '{$.$api.id}'
    </>
}`;

// simple logger
let logs: string[] = [];
function log(msg: string) {
    logs.push("<b>" + (logs.length + 1) + ". </b>" + msg);
    document.getElementById("logs")!.innerHTML = "<div> Logs: <br/>" + logs.join(", ") + "</div>";
}

// @@extract: main
const main = $template`(tabSelection:string, $) => {
    <div class="info">
        Tab Selection: {tabSelection}
    </>
    <*tabs selection={=$.tabSelection}>
        <.tab id="tabA">
            <.title> tab title <b> A </></>
            <*heavyComponent id="cptA"/>
        </>
        <.tab id="tabB">
            <.title> tab title <b> B </></>
            <*heavyComponent id="cptB"/>
        </>
        <.tab id="tabC">
            <.title> tab title <b> C </></>
            <*heavyComponent id="cptC"/>
        </>
    </>
}`;

main().attach(document.getElementById("output")).render();
