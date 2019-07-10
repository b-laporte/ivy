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

@Data class MainState {
    showExpandingRow = false;
    teamList: MlbTeam[];
}

// --------------------------------------------------------------------------------------------------
// Main template
const mainStyle = "padding: 1;margin: 1;background-color: white;width: 1000px;display: block;";

const main = template(`($state:MainState) => {
    <h2> #cfc-expanding-row initialization benchmark# </h2>

    <section>
      <button id="reset" click()={reset($state)}> #Reset# </button>
      <button id="init" click()={init($state)}> #Init# </button>
      <button id="run" click()={runAll()}> #Run All# </button>
    </section>

    <benchmark-area class="cfc-ng2-region" style={::mainStyle}>
        if ($state.showExpandingRow) {
            <*grid>
                for (let team of $state.teamList) {
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

let fakeTeams: MlbTeam[] = [], resetCount = 0;

function reset($state: MainState, numItems = 5000) {
    $state.showExpandingRow = false;
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

function init($state: MainState) {
    $state.teamList = fakeTeams;
    $state.showExpandingRow = true;
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
