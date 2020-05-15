// @@extract: imports
import { $template } from '../../../iv';
import { IvTemplate } from '../../../iv/types';
import { Data } from '../../../trax';

// @@extract: value-import
import { value, ValueAdapter } from "../../../iv/inputs";

// @@extract: data-model
@Data class FormDataModel {
    month: string = "JAN";  // month code: JAN, FEB, MAR, etc.
    urgent: string = "N";   // Y or N
}

// @@extract: template
const main = $template`(data: FormDataModel) => {
    <div class="main">
        <div class="title"> Form: </>
        <div>
            <div class="lbl"> 
                Month:
                <input type="number" min=1 max=12 @value(data={=data.month} adapter={monthAdapter})/>
            </>
            <label>
                <input type="checkbox" @value(data={=data.urgent} adapter={boolAdapter})/>
                urgent
            </>
        </>
        <div class="title"> Data model: </>
        <div>
            <span class="lbl"> Month: </> "{data.month}"
        </>
        <div>
            <span class="lbl"> Urgent: </> "{data.urgent}"
        </>
    </>
}`;

// @@extract: conversions
const boolAdapter: ValueAdapter = {
    value2data(v: any) {
        return v ? "Y" : "N";
    },
    data2value(d: string) {
        return (d === "Y" || d === "y");
    }
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const monthAdapter: ValueAdapter = {
    value2data(n: string) {
        const nbr = parseInt(n, 10);
        if (nbr > 0 && nbr < 13) return MONTHS[nbr - 1];
        return "";
    },
    data2value(m: string) {
        const idx = MONTHS.indexOf(m.toUpperCase());
        if (idx > -1) return idx + 1;
        return "";
    }
}

// @@extract: render
main().attach(document.body).render();
