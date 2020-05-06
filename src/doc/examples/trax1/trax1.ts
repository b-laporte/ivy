// @@extract: import
import { Data, watch, unwatch, version, numberOfWatchers } from "../../../trax";

// @@extract: definition
@Data class User {
    firstName: string;
    lastName: string;
    id: number;
}

// @@extract: init
const user = new User();
user.firstName = "Marge";
user.lastName = "Simpson";
user.id = 1;

log("init complete (watch not activated)"); // log information in the log panel (bottom)
displayData(); // update the user data in the gray panel

// @@extract: update
let count = 0;
// update button
document.getElementById("update-btn")!.addEventListener("click", () => {
    user.firstName += "+" + (++count);
    user.id++;
});

// @@extract: watch
let wf: any = null; // watch callback
// watch button
document.getElementById("watch-btn")!.addEventListener("click", () => {
    if (numberOfWatchers(user) === 0) {
        wf = watch(user, () => {
            log("user changed - version: " + version(user));
            displayData();
        });
        log("watch <b>activated</b>");
    } else {
        log("watch <b>already activated</b>");
    }
});

// @@extract: unwatch
// unwatch button
document.getElementById("unwatch-btn")!.addEventListener("click", () => {
    unwatch(user, wf);
    log("watch <b>deactivated</b>");
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
        '<div class="user"> <b>user:</b> ',
        user.firstName, ' / ', user.lastName, ' / ', user.id,
        '</div>'
    ].join('');
}
