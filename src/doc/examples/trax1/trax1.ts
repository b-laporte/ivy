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

log("init complete (watch not activated)");
displayData();

// @@extract: update
let count = 0;
document.getElementById("update")!.addEventListener("click", () => {
    // update user properties
    user.firstName += "+" + (++count);
    user.id++;
});

// @@extract: watch-buttons
let wf: any = null; // watch callback

document.getElementById("watch")!.addEventListener("click", () => {
    // watch button
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
document.getElementById("unwatch")!.addEventListener("click", () => {
    // unwatch button
    unwatch(user, wf);
    log("watch <b>deactivated</b>");
});
document.getElementById("reload")!.addEventListener("click", () => {
    // reload button
    location.reload();
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
        '<div class="user"> <b>user:</b> ', 
        user.firstName, ' / ', user.lastName, ' / ', user.id, 
        '</div>'
    ].join('');
}
