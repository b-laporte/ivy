import {iv} from '../../src/iv/iv';
import {render} from '../../src/iv/htmlrenderer';

/* global document, ENV, Monitoring */

var pkg = iv`
    <template #dbmon testName:string databases:Array>
        <div>
            {{testName}}
            <table class="table table-striped latest-data">
                <tbody>
                    % for (var i=0;databases.length>i;i++) {
                        % var db=databases[i];
                        <tr>
                            <td class="dbname">{{db.dbname}}</td>
                            // Sample
                            <td class="query-count">
                                <span [className]=db.lastSample.countClassName>{{db.lastSample.nbQueries}}</span>
                            </td>
                            // Query
                            % for (var j=0;db.lastSample.topFiveQueries.length>j;j++) {
                                % var q=db.lastSample.topFiveQueries[j];
                                <td [className]=q.elapsedClassName>
                                    {{q.formatElapsed}}
                                    <div class="popover left">
                                        <div class="popover-content">{{q.query}}</div>
                                        <div class="arrow"/>
                                    </div>
                                </td>
                            % }
                        </tr>
                    % }
                </tbody>
            </table>
        </div>
    </template>
`;

var app = {
    view:null,

    refresh: function() {
        var args = {"testName":"iv", "databases":ENV.generateData().toArray()};
        if (!this.view) {
            this.view = render(pkg.dbmon, document.getElementById("app"), args);
        } else {
            this.view.refresh(args);
        }
        Monitoring.renderRate.ping();
    }
};

setInterval(function main(){
    app.refresh();
}, ENV.timeout);


// nb: to run chrome with precise memory flag on a mac:
// open -a Google\ Chrome --args --enable-precise-memory-info
