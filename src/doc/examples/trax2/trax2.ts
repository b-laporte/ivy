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
// user1 button: change user1
document.getElementById("update1-btn")!.addEventListener("click", () => {
    user1.firstName += "+" + ++count;
});
// user2 button: change user2
document.getElementById("update2-btn")!.addEventListener("click", () => {
    user2.firstName += "+" + ++count;
    user2.lastName += "+" + count;
});
// data button: change the data object stored in the group
document.getElementById("update3-btn")!.addEventListener("click", () => {
    // update group data (will not trigger a watch callback call)
    g.data.value1 += "+" + ++count;
});
// add button: add a user in the group members
document.getElementById("add-btn")!.addEventListener("click", () => {
    let u = new User();
    u.firstName = "Bart" + ++count;
    u.lastName = "Simpson";
    u.id = count;
    g.members.push(u);
});
// remove button: remove the first member of the group
document.getElementById("remove-btn")!.addEventListener("click", () => {
    g.members.splice(0, 1); // remove the first element
});
// replace data button: replace the data object with a new object
document.getElementById("new-data-btn")!.addEventListener("click", () => {
    // replace data button
    // replace the group data with a new object -> will trigger a refresh
    g.data = {
        value1: "VAL1-" + ++count,
        value2: "VAL2-" + count
    }
});

// @@extract: watch
let wf: any = null; // watch callback
// watch button
document.getElementById("watch-btn")!.addEventListener("click", () => {
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
// unwatch button
document.getElementById("unwatch-btn")!.addEventListener("click", () => {
    unwatch(g, wf);
    log("group watch <b>deactivated</b>");
});

// @@extract: display-functions
// utility functions
let logs: string[];
function log(msg: string) {
    logs = logs || [];
    let len = logs.length + 1;
    logs.push("<b>" + len + ". </b>" + msg);

    document.getElementById("logs")!.innerHTML = [
        '<b>logs:</b> <br/>', logs.join(', ')
    ].join('');
}
function displayData() {
    document.getElementById("data")!.innerHTML = [
        '<div class="group">',
        '<b>name:</b> ', g.name, ', ',
        '<b>leader:</b> ', g.leader.firstName, ' / ', g.leader.lastName, ', ',
        '<b>number of members:</b> ', g.members.length, ', ',
        '<div><b>members:</b>',
        g.members.map((m, idx) => `
            <b>${idx + 1}.</b> ${m.firstName} / ${m.lastName}
        `).join(''),
        '</div><b>data:</b> ', JSON.stringify(g.data), '</>',
        '</div>'
    ].join('');
}
