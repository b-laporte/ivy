require('./index.html'); // webpack dependency
require('./styles.css'); // webpack dependency
import { template } from "../../iv";
import { Data } from '../../trax/trax';
import { grid } from './grid';

@Data class MlbTeam {
    name: string;
    id: number;
    division: string;
    stadium: string;
    projection: string;
}

// --------------------------------------------------------------------------------------------------
// Main template
const mainStyle = "padding: 1;margin: 1;background-color: white;width: 1000px;display: block;";

const main = template(`($params, showExpandingRow=false, teamList:MlbTeam[]) => {
    <h2> #cfc-expanding-row initialization benchmark# </h2>

    <section>
      <button id="reset" click()={reset($params)}> #Reset# </button>
      <button id="init" click()={init($params)}> #Init# </button>
      <button id="run" click()={runAll()}> #Run All# </button>
    </section>

    <benchmark-area class="cfc-ng2-region" style={::mainStyle}>
        if (showExpandingRow) {
            <*grid>
                for (let team of teamList) {
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
}`);

let fakeTeams: MlbTeam[] = [];

function reset($params, numItems = 5000) {
    $params.showExpandingRow = false;

    fakeTeams = [];
    let team: MlbTeam;
    for (let i = 0; i < numItems; i++) {
        team = new MlbTeam();
        team.name = `name ${i}`;
        team.id = i;
        team.division = `division ${i}`;
        team.stadium = `stadium ${i}`;
        team.projection = `projection ${i}`;
        fakeTeams.push(team);
    }
}

function init($params) {
    $params.teamList = fakeTeams;
    $params.showExpandingRow = true;
}

async function runAll() {
    alert("RUN_ALL")
    // await execTimed('initialization_benchmark', async () => { await this.doInit(); });
}

// --------------------------------------------------------------------------------------------------
// bootstrap main in the page body
let tpl = main()
    .attach(document.body)
    .refresh();
