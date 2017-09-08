import { htmlRenderer } from "../../htmlrenderer";
import { Benchmark } from './benchmark';

const renderer = htmlRenderer(document.getElementById("root"), jfb);
const benchmark = new Benchmark(renderer);
benchmark.refresh();

function jfb(benchmark: Benchmark) {
    `---
    <div a:class="container">
        <div a:class="jumbotron">
            <div a:class="row">
                <div a:class="col-md-6">
                    <h1>IV</h1>
                </div>
                <div a:class="col-md-6">
                    <div a:class="col-sm-6 smallpad">
                        <button type="button" a:class="btn btn-primary btn-block" id="run" onclick()=benchmark.run() ref="text">Create 1,000 rows</button>
                    </div>
                    <div a:class="col-sm-6 smallpad">
                        <button type="button" a:class="btn btn-primary btn-block" id="runlots" onclick()=benchmark.runLots()>Create 10,000 rows</button>
                    </div>
                    <div a:class="col-sm-6 smallpad">
                        <button type="button" a:class="btn btn-primary btn-block" id="add" onclick()=benchmark.add() ref="text">Append 1,000 rows</button>
                    </div>
                    <div a:class="col-sm-6 smallpad">
                        <button type="button" a:class="btn btn-primary btn-block" id="update" onclick()=benchmark.update()>Update every 10th row</button>
                    </div>
                    <div a:class="col-sm-6 smallpad">
                        <button type="button" a:class="btn btn-primary btn-block" id="clear" onclick()=benchmark.clear()>Clear</button>
                    </div>
                    <div a:class="col-sm-6 smallpad">
                        <button type="button" a:class="btn btn-primary btn-block" id="swaprows" onclick()=benchmark.swapRows()>Swap Rows</button>
                    </div>
                </div>
            </div>
        </div>
        <table a:class="table table-hover table-striped test-data">
            <tbody>
                % benchmark.data.forEach((item) => {
                <tr [a:class]=(item.id===benchmark.selected?'danger':'')>
                    <td a:class="col-md-1">{{item.id}}</td>
                    <td a:class="col-md-4">
                        <a href="#" onclick(e)=benchmark.select(item, e)>{{item.label}}</a>
                    </td>
                    <td a:class="col-md-1"><a href="#" onclick(e)=benchmark.delete(item, e)><span a:class="glyphicon glyphicon-remove"></span></a></td>
                    <td a:class="col-md-6"></td>
                </tr>
                % });
            </tbody>
        </table>
        <span a:class="preloadicon glyphicon glyphicon-remove" attr:aria-hidden="true"></span>
    </div>
     ---`
}

