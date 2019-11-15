require('./index.html'); // webpack dependency
require('./styles.css'); // webpack dependency
require('./ENV.data');   // webpack dependency

import { template } from "../../iv";

let perfMonitor = window["perfMonitor"] as any, ENV = window["ENV"] as any;

perfMonitor.startFPSMonitor()
perfMonitor.startMemMonitor()
perfMonitor.initProfiler("render")

const DbMon = template(`(databases) => {
    <div>
        <table class="table table-striped latest-data">
            <tbody>
                for (let db of databases || []) {
                    <tr>
                        <td class="dbname"> #{db.dbname}# </td>
                        <td class="query-count">
                            <span class={db.lastSample.countClassName}>
                                #{db.lastSample.nbQueries}#
                            </span>
                        </td>
                        for (let q of db.lastSample.topFiveQueries) {
                            <td class={"Query " + q.elapsedClassName}>
                                #{q.formatElapsed}#
                                <div class="popover left">
                                    <div class="popover-content"> #{q.query}# </div>
                                    <div class="arrow"/>
                                </div>
                            </td>
                        }
                    </tr>
                }
            </tbody>
        </table>
    </div>
}`);

const tpl = DbMon().attach(document.getElementById("app")).render();

function update() {
    requestAnimationFrame(update);
    // explicit synchronous rendering
    perfMonitor.startProfile("render");
    tpl.render({ databases: ENV.generateData().toArray() })
    perfMonitor.endProfile("render");
    // implicit asynchronous rendering would be done like this (identical performance):
    // tpl.api.databases = ENV.generateData().toArray();
}
update();