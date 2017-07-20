import { VdRenderer } from "../../iv";
import { htmlRenderer } from "../../htmlrenderer";
import { Benchmark } from './benchmark';

const renderer = htmlRenderer(document.getElementById("root"), jfb);
const benchmark = new Benchmark(renderer);
benchmark.refresh();

function jfb(r: VdRenderer, benchmark: Benchmark) {
    `---
    <div class="container">
        <div class="jumbotron">
            <div class="row">
                <div class="col-md-6">
                    <h1>IV</h1>
                </div>
                <div class="col-md-6">
                    <div class="col-sm-6 smallpad">
                        <button type="button" class="btn btn-primary btn-block" id="run" onclick()=benchmark.run() ref="text">Create 1,000 rows</button>
                    </div>
                    <div class="col-sm-6 smallpad">
                        <button type="button" class="btn btn-primary btn-block" id="runlots" onclick()=benchmark.runLots()>Create 10,000 rows</button>
                    </div>
                    <div class="col-sm-6 smallpad">
                        <button type="button" class="btn btn-primary btn-block" id="add" onclick()=benchmark.add() ref="text">Append 1,000 rows</button>
                    </div>
                    <div class="col-sm-6 smallpad">
                        <button type="button" class="btn btn-primary btn-block" id="update" onclick()=benchmark.update()>Update every 10th row</button>
                    </div>
                    <div class="col-sm-6 smallpad">
                        <button type="button" class="btn btn-primary btn-block" id="clear" onclick()=benchmark.clear()>Clear</button>
                    </div>
                    <div class="col-sm-6 smallpad">
                        <button type="button" class="btn btn-primary btn-block" id="swaprows" onclick()=benchmark.swapRows()>Swap Rows</button>
                    </div>
                </div>
            </div>
        </div>
        <table class="table table-hover table-striped test-data">
            <tbody>
                % benchmark.data.forEach((item) => {
                <tr [class]=(item.id===benchmark.selected?'danger':'')>
                    <td class="col-md-1">{{item.id}}</td>
                    <td class="col-md-4">
                        <a href="#" onclick(e)=benchmark.select(item, e)>{{item.label}}</a>
                    </td>
                    <td class="col-md-1"><a href="#" onclick(e)=benchmark.delete(item, e)><span class="glyphicon glyphicon-remove"></span></a></td>
                    <td class="col-md-6"></td>
                </tr>
                % });
            </tbody>
        </table>
        <span class="preloadicon glyphicon glyphicon-remove" attr:aria-hidden="true"></span>
    </div>
     ---`
}

