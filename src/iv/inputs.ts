import { API, defaultParam, required, IvElement, io, decorator } from ".";
import { ref } from '../trax';

const U = undefined,
    VALUE = "value",
    CHECKED = "checked",
    DATA = "data",
    SUPPORTED_TYPES = ["text", "radio", "checkbox", "number", "range"],
    PASSIVE = { passive: true }

export interface ValueAdapter {
    value2data?: Function;              // default depends on input type
    data2value?: Function;              // default depends on input type
}

@API class Value {
    @required @defaultParam @io data: any;
    @required $targetElt: IvElement;
    events: string = "input";           // semi-colon-separated lists of events that should be listened to, on top of change - e.g. "input;focus;blur"
    @ref adapter?: ValueAdapter;
    debounce: number = 0;               // debounce time in ms
}
export const value = decorator(Value, ($api: Value) => {
    let elt: any,
        inputType = "",
        lastValue = "",
        debouncer: Debouncer | undefined,
        lastEvents = "",
        listeners: { [key: string]: boolean } = {}; // true if event is being listened to
    function changeHandler(e: Event) {
        if (inputType === "number" && e.type === "input") {
            let d = (e[DATA]);
            if (d === "e" || d === "E" || d === "-" || d === "+") {
                return; // we cannot read the input value otherwise it will erase the input
            }
        }
        if ($api.debounce <= 0) {
            updateData();
        } else {
            if (!debouncer) {
                debouncer = new Debouncer("@value error");
            }
            debouncer.duration = $api.debounce!;
            debouncer.process(updateData);
        }
    }
    function updateData() {
        let v: any;
        if (inputType === "text" || inputType === "number") {
            v = elt[VALUE];
        } else if (inputType === "range") {
            const value = elt[VALUE];
            if (value === '') {
                v = 0;
            } else {
                v = parseInt(value);
                if (isNaN(v)) {
                    throw "Invalid input value '" + value + "': value of input type range shall be an integer";
                }
            }
        } else if (inputType === "checkbox") {
            v = elt[CHECKED];
        } else if (inputType === "radio") {
            if (elt[CHECKED]) {
                v = elt[VALUE];
            } else {
                return;
            }
        }
        $api.data = $api.adapter!.value2data!(v);
    }
    return {
        $init() {
            elt = $api.$targetElt;
            if (elt.tagName !== "INPUT" && elt.tagName !== "TEXTAREA" && elt.tagName !== "SELECT") {
                throw "@value can only be used on input, textarea and select elements";
            }
            inputType = "text";
            if (elt.tagName === "INPUT") {
                inputType = elt.getAttribute("type");
                if (SUPPORTED_TYPES.indexOf(inputType) === -1) {
                    throw "Invalid input type '" + inputType + "': @value can only be used on types '" + SUPPORTED_TYPES.join("', '") + "'";
                }
            }
            elt.addEventListener("change", changeHandler, PASSIVE);
        },
        $render() {
            let adapter: ValueAdapter;
            if ($api.adapter === U) {
                adapter = $api.adapter = {};
            } else {
                adapter = $api.adapter;
            }
            if (adapter.value2data === undefined) {
                adapter.value2data = (v: any) => {
                    if (inputType === "number") {
                        if (v === "") {
                            return 0; // todo: defaultValue
                        }
                        try {
                            v = parseFloat(v);
                        } catch (e) {
                            console.log("@value conversion error: ", e);
                            return 0; // todo: defaultValue
                        }
                    }
                    return v;
                }
            }
            if (adapter.data2value === U) {
                adapter.data2value = noop;
            }
            if (lastValue !== $api.data) {
                // update the value in the field
                lastValue = $api.data;
                let val = adapter.data2value(lastValue);
                if (inputType === "text" || inputType === "number") {
                    elt[VALUE] = val;
                } else if (inputType === "range") {
                    if (!Number.isInteger(val)) {
                        throw "Invalid input value '" + val + "': value of input type range shall be an integer";
                    }
                    elt[VALUE] = `${val}`;
                } else if (inputType === "checkbox") {
                    elt[CHECKED] = !!val;
                } else if (inputType === "radio") {
                    elt[CHECKED] = (val === elt[VALUE]);
                }
            }
            if (lastEvents !== $api.events) {
                // unregister old events that are not used any more
                let newEvents = $api.events.split(";"), oldEvents = lastEvents.split(";");
                for (let t of oldEvents) {
                    if (t === "change") continue; // change cannot be removed
                    if (newEvents.indexOf(t) < 0 && listeners[t]) {
                        elt.removeEventListener(t, changeHandler, PASSIVE);
                        listeners[t] = false;
                    }
                }

                // register to new events
                for (let t of newEvents) {
                    if (t === "change") continue; // change is already added
                    if (!listeners[t]) {
                        elt.addEventListener(t, changeHandler, PASSIVE);
                        listeners[t] = true;
                    }
                }
                lastEvents = $api.events;
            }
        },
        $dispose() {
            if (elt) {
                elt.removeEventListener("change", changeHandler);

                if (lastEvents !== "") {
                    let oldEvents = lastEvents.split(";");
                    for (let t of oldEvents) {
                        if (t === "change") continue; // change already removed
                        elt.removeEventListener(t, changeHandler, PASSIVE);
                    }
                }
                lastEvents = "";
                debouncer = undefined;
            }
        }
    }
});

export class Debouncer {
    private timeoutId: any = null;
    duration: number = 100;

    constructor(public errContext = "Error in callback") { }

    process(cb: Function) {
        if (this.duration <= 0) {
            runCallback(cb, this.errContext);
        } else {
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
            }
            this.timeoutId = setTimeout(() => {
                this.timeoutId = null;
                runCallback(cb, this.errContext);
            }, this.duration);
        }
    }
}

function runCallback(cb: Function, errorContext: string) {
    try {
        cb();
    } catch (e) {
        throw "Debounce - " + errorContext + "\n" + (e.message ? e.message : e);
    }
}

function noop(v: any) {
    return v;
};