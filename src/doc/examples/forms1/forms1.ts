// @@extract: imports
import { $template } from '../../../iv';
import { IvTemplate } from '../../../iv/types';
import { Data } from '../../../trax';

// @@extract: value-import
import { value } from "../../../iv/inputs";

// @@extract: data-model
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

// @@extract: form
const carEditor = $template`(data:CarDescription, className:string="", $template:IvTemplate) => {
    <div class={"car editor "+className}>
        <div>
            <div class="lbl"> Name: </>
            <input type="text" @value={=data.name}/>
        </>
        <div>
            <div class="lbl"> Model Year: </>
            <input type="number" @value={=data.modelYear}/>
        </>
        <div>
            <div class="color"> Color: </>
            $for (let color of colorCodes) {
                // group of radio buttons
                <label> 
                    <input type="radio" 
                        // no-need for unique name as the data binding 
                        // will automatically group the radio inputs
                        // name={"color" + $template.uid} 
                        value={color} // this is the code associated to this radio button
                        @value={=data.color} // binding to the data model
                    /> 
                    {::i18nColors[color]}
                </>
            }
        </>
        <div>
            <label>
                <input type="checkbox" @value={=data.electric}/> electric
            </label>
        </>
    </>
}`;

// @@extract: main
const main = $template`(data:CarDescription) => {
    <div class="summary">
        <div class="title"> Summary </>
        <div> Car name: {data.name} </>
        <div> Model year: {data.modelYear} </>
        <div> Color code: {data.color} </>
        <div> Electric: {data.electric} </>
    </>
    <div class="columns">
        <*carEditor className="col1" {data}/> // equivalent to data={data}
        <*carEditor className="col2" {data}/> // 2nd instance to demonstrate data-binding
    </>
}`;

const cd = new CarDescription();
cd.name = "Ford Model T";
cd.modelYear = 1908;
cd.electric = false;
cd.color = "BK";

main().attach(document.body).render({ data: cd });
