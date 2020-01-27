// @@extract: imports
import { template } from '../../../iv';
import { IvTemplate } from '../../../iv/types';
import { Data } from '../../../trax';

// @@extract: value-import
import { value } from "../../../iv/inputs";

// @@extract: data-model
@Data class FormDataModel {
    month: string = "JAN";  // month code: JAN, FEB, MAR, etc.
    urgent: string = "N";   // Y or N
}

// @@extract: template
const main = template(`(data: FormDataModel) => {
    <div class="main">
        <div class="title"> # Form: # </>
        <div>
            <div class="lbl"> 
                # Month: # 
                <input type="number" min=1 max=12
                    @value(data={=data.month} input2data={nbr2month} data2input={month2nbr})
                />
            </>
            <label>
                <input type="checkbox" 
                    @value(data={=data.urgent} input2data={bool2str} data2input={str2bool})
                /> 
                # urgent # 
            </>
        </>
        <div class="title"> # Data model: # </>
        <div>
            <div class="lbl"> # Month: # </> # "{data.month}" #
        </>
        <div>
            <div class="lbl"> # Urgent: # </> # "{data.urgent}" #
        </>
    </>
}`);

// @@extract: conversions
function bool2str(v: any) {
    return v ? "Y" : "N";
}
function str2bool(d: string) {
    return (d === "Y" || d === "y");
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function nbr2month(n: string) {
    const nbr = parseInt(n, 10);
    if (nbr > 0 && nbr < 13) return MONTHS[nbr - 1];
    return "";
}
function month2nbr(m: string) {
    const idx = MONTHS.indexOf(m.toUpperCase());
    if (idx > -1) return idx + 1;
    return "";
}

// @@extract: render
main().attach(document.body).render();
