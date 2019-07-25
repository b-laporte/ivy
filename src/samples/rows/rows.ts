require('./index.html'); // webpack dependency
require('./styles.css'); // webpack dependency
import { template } from "../../iv";
import { Data, changeComplete } from '../../trax/trax';
import { grid } from './grid';

@Data class MlbTeam {
    name: string;
    id: number;
    division: string;
    stadium: string;
    projection: string;
}

@Data class MainData {
    showExpandingRow = false;
    teamList: MlbTeam[];
}

// --------------------------------------------------------------------------------------------------
// Main template
const mainStyle = "padding: 1;margin: 1;background-color: white;width: 1000px;display: block;";

const main = template(`(data:MainData) => {
    <h2> #cfc-expanding-row initialization benchmark# </h2>

    <section>
        <button id="run" click()={runAll(data)}> #Run All# </button>
    </section>

    <benchmark-area class="cfc-ng2-region" style={::mainStyle}>
        if (data.showExpandingRow) {
            <*grid>
                for (let team of data.teamList) {
                    <.row id={team.id}>
                        <.summary> # Team {team.id} # </>
                        <.caption> 
                            # Team '{team.name}' -- #
                            <a href="https://www.google.com" class="cfc-demo-expanding-row-caption-link"> 
                                # team link {team.id} #
                            </a>
                        </.caption>
                        <ul> // ace-list ?
                            <li> # Division: {team.division} # </li>
                            <li>
                                <a href="https://www.google.com"> #{team.stadium}# </a>
                            </li>
                            <li> #Projected Record: {team.projection} #</li>
                        </ul>
                    </.row>
                }
            </*grid>
        }
    </benchmark-area>
    <section>
        <button id="reset" click()={reset(data)}> #Reset# </button>
        <button id="init" click()={init(data)}> #Init# </button>
    </section>
}`);

let fakeTeams: MlbTeam[] = [], resetCount = 0;

function reset(data: MainData, numItems = 5000) {
    data.showExpandingRow = false;
    resetCount++;

    fakeTeams = [];
    let team: MlbTeam;
    for (let i = 0; i < numItems; i++) {
        team = new MlbTeam();
        team.name = `name ${resetCount}-${i}`;
        team.id = i;
        team.division = `division ${resetCount}-${i}`;
        team.stadium = `stadium ${resetCount}-${i}`;
        team.projection = `projection ${resetCount}-${i}`;
        fakeTeams.push(team);
    }
}

function init(data: MainData) {
    data.teamList = fakeTeams;
    data.showExpandingRow = true;
}

async function runAll(data: MainData) {
    reset(data);
    init(data);
}

// --------------------------------------------------------------------------------------------------
// bootstrap main in the page body
let tpl = main()
    .attach(document.body)
    .render();
    
document.getElementById("run")!.focus(); // focus first button to test keyboard navigation
