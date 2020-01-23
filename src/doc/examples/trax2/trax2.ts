// @@extract: import
import { Data, watch, unwatch, version, numberOfWatchers } from "../../../trax";

// @@extract: definition
@Data class User {
    firstName: string;
    lastName: string;
    id: number;
}

@Data class Group {
    leader: User;
    name: string;
    members: User[]; // sub-references will be tracked
    data: any;       // only root reference will be tracked
}

// @@extract: init
const user1 = new User();
user1.firstName = "Marge";
user1.lastName = "Simpson";
user1.id = 1;

const user2 = new User();
user2.firstName = "Homer";
user2.lastName = "Simpson";
user2.id = 1;

const g = new Group();
g.name = "The Simpsons";
g.leader = user1;
g.members[0] = user1;
g.members.push(user2);
g.data = {
    value1: "v1",
    value2: "v2"
};

log("init complete (watch not activated)");
displayData();

// @@extract: update-functions
let count = 0;
document.getElementById("update1")!.addEventListener("click", () => {
    // user1 button
    user1.firstName += "+" + ++count;
});
document.getElementById("update2")!.addEventListener("click", () => {
    // user2 button
    user2.firstName += "+" + ++count;
    user2.lastName += "+" + count;
});
document.getElementById("update3")!.addEventListener("click", () => {
    // data button
    // update group data (will not trigger a watch callback call)
    g.data.value1 += "+" + ++count;
});
document.getElementById("add")!.addEventListener("click", () => {
    // add button
    let u = new User();
    u.firstName = "Bart" + ++count;
    u.lastName = "Simpson";
    u.id = count;
    g.members.push(u);
});
document.getElementById("remove")!.addEventListener("click", () => {
    // remove button
    g.members.splice(0, 1); // remove the first element
});
document.getElementById("new_data")!.addEventListener("click", () => {
    // replace data button
    // replace the group data with a new object -> will trigger a refresh
    g.data = {
        value1: "VAL1-" + ++count,
        value2: "VAL2-" + count
    }
});
document.getElementById("reload")!.addEventListener("click", () => {
    // reload button
    location.reload();
});

// @@extract: watch
let wf: any = null; // watch callback

document.getElementById("watch")!.addEventListener("click", () => {
    if (numberOfWatchers(g) === 0) {
        wf = watch(g, () => {
            log(`group changed - versions: 
                g=${version(g)} 
                user1=${version(user1)} 
                user2=${version(user2)}`);
            displayData();
        });
        log("group watch <b>activated</b>");
    } else {
        log("group watch <b>already activated</b>");
    }
});

// @@extract: unwatch
document.getElementById("unwatch")!.addEventListener("click", () => {
    unwatch(g, wf);
    log("group watch <b>deactivated</b>");
});

// @@extract: display-functions
let logs: string[];
function log(msg: string) {
    logs = logs || [];
    logs.push(msg);

    document.getElementById("logs")!.innerHTML = [
        '<b>logs:</b> <br/>', logs.join('<br/>')
    ].join('');
}
function displayData() {
    document.getElementById("data")!.innerHTML = [
        '<div class="group">',
        '<div><b>name:</b> ', g.name, '</div>',
        '<div><b>leader:</b> ', g.leader.firstName, ' / ', g.leader.lastName, '</div>',
        '<div><b>number of members:</b> ', g.members.length, '</div>',
        '<div><b>members:</b></div>',
        g.members.map((m, idx) => `
            <div class="member"> 
            ${idx + 1}. ${m.firstName} / ${m.lastName}
            </div>`).join(''),
        '<div><b>data:</b> ', JSON.stringify(g.data), '</div>',
        '</div>'
    ].join('');
}
