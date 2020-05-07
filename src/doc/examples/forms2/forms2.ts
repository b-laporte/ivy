// @@extract: imports
import { $template } from '../../../iv';
import { IvTemplate } from '../../../iv/types';
import { Data } from '../../../trax';

// @@extract: value-import
import { value } from "../../../iv/inputs";

@Data class CarDescription {
    name: string;       // free flow text
    modelYear: number;  // 4-digit number
    electric: boolean;  // true if full electric model
    color: string;      // 2-letter code: WH:while BK:black RD:red BL:blue
}

const colorCodes = ["WH", "BK", "RD", "BL"],
    i18nColors = {
        "WH": "white",
        "BK": "black",
        "RD": "red",
        "BL": "blue"
    };

// @@extract: options
@Data class ValueOptions {
    debounce: number = 0;        // default debounce value
    events: string = "input";    // default events value
}

// @@extract: options-editor
const optionEditor = $template`(o:ValueOptions, 
        evtInput:boolean = true, 
        evtFocus:boolean, 
        evtBlur:boolean, 
        className: string = ""
        $) => {
    // sync o.events with the individual params
    $exec o.events = getEventsArg(evtInput, evtFocus, evtBlur);

    <div class={"option editor " + className}>
        <div>
            <div class="lbl"> Debounce (ms): </>
            <input type="number" @value={=o.debounce} />
        </>
        <div>
            <div class="lbl"> Extra events: </>
            <label> <input type="checkbox" @value={=$.evtInput}/> input </>
            <label> <input type="checkbox" @value={=$.evtFocus}/> focus </>
            <label> <input type="checkbox" @value={=$.evtBlur}/> blur </>
        </>
        <div>
            <div class="lbl"> Events value: </>
            "{o.events}"
        </>
    </>
}`;

function getEventsArg(evtInput, evtFocus, evtBlur) {
    const events: string[] = [];
    if (evtInput) events.push("input");
    if (evtFocus) events.push("focus");
    if (evtBlur) events.push("blur");
    return events.join(";");
}

// @@extract: form
const carEditor = $template`(data:CarDescription, 
        o:ValueOptions, 
        className: string = "",
        $template:IvTemplate) => {
    <div class={"car editor " + className}>
        <div>
            <div class="lbl"> Name: </>
            <input type="text" 
                @value(data={=data.name} debounce={o.debounce} events={o.events})
            />
        </>
        <div>
            <div class="lbl"> Model Year: </>
            <input type="number" 
                @value(data={=data.modelYear} debounce={o.debounce} events={o.events})
            />
        </>
        <div>
            <div class="color"> Color: </>
            $for (let color of colorCodes) {
                // group of radio buttons
                <label> 
                    <input type="radio" 
                        name={"color" + $template.uid} // name must be unique
                        value={color} // this is the code associated to this radio button
                        @value(data={=data.color} debounce={o.debounce} events={o.events})
                    /> 
                    {::i18nColors[color]}
                </>
            }
        </>
        <div>
            <label>
                <input type="checkbox" 
                    @value(data={=data.electric} debounce={o.debounce} events={o.events})
                /> electric 
            </label>
        </>
    </>
}`;

const main = $template`(data:CarDescription, o:ValueOptions) => {
    <div class="columns">
        <div class="summary col1">
            <div class="title"> Summary </>
            <div> Car name: {data.name} </>
            <div> Model year: {data.modelYear} </>
            <div> Color code: {data.color} </>
            <div> Electric: {data.electric} </>
        </>
        <*optionEditor className="col2" {o}/>
    </>
    <div class="columns">
        <*carEditor className="col1" {data} {o}/> // equivalent to data={data}
        <*carEditor className="col2" {data} {o}/> // 2nd instance to demonstrate data-binding
    </>
}`;

const cd = new CarDescription();
cd.name = "Ford Model T";
cd.modelYear = 1908;
cd.electric = false;
cd.color = "BK";

const options = new ValueOptions();

main().attach(document.body).render({ data: cd, o: options });
