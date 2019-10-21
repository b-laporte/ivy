import { API, defaultParam, required, IvElement, io, decorator } from ".";


const ATT_VALUE = "value",
    SUPPORTED_TYPES = ["text", "radio", "checkbox", "number"]
@API class Value {
    @required @defaultParam @io data: any;
    @required $targetElt: IvElement;
    events: string;              // semi-colon-separated lists of events that should be listened to, on top of change - e.g. "input;focus;blur"
    input2data: Function;        // default depends on input type
    data2input: Function;        // default depends on input type
    debounce: number = 100;      // if set, input event will be listened to
}
export const value = decorator(Value, ($api: Value) => {
    let input: any, inputType = "", lastValue = "";
    function changeHandler() {
        if ($api.debounce === 0) {
            updateData();
        } else {
            console.log("TODO: debounce");
        }
    }
    function updateData() {
        // todo input2data
        let v = input.getAttribute(ATT_VALUE);
        $api.data = v;
    }
    return {
        $init() {
            input = $api.$targetElt;
            if (input.tagName !== "INPUT") {
                throw "@value can only be used on input elements";
            }
            inputType = input.getAttribute("type");
            if (SUPPORTED_TYPES.indexOf(inputType) === -1) {
                throw "Invalid input type '" + inputType + "': @value can only be used on type '" + SUPPORTED_TYPES.join("', '" + "'");
            }
            input.addEventListener("change", changeHandler, { passive: true });
        },
        $render() {
            if (lastValue !== $api.data) {
                // update the value in the field
                lastValue = $api.data;
                input.setAttribute(ATT_VALUE, lastValue);
            }
            // check properties that may have changed
        },
        $dispose() {
            if (input) {
                input.removeEventListener("change", changeHandler)
            }
        }
    }
});
