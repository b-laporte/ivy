// @@extract: all
import { $template } from "../../../iv";
import { value } from "../../../iv/inputs";
import { Data } from '../../../trax';


// @@extract: main
@Data class FormData {
    comment: string;    // multi-line text
    color: string;      // 2-letter code: WH:while BK:black RD:red BL:blue
}

const colorCodes = ["WH", "BK", "RD", "BL"],
    i18nColors = {
        "WH": "white",
        "BK": "black",
        "RD": "red",
        "BL": "blue"
    };

const main = $template`(d:FormData) => {
    <div> Multi-line text (textarea): </>
    <textarea class="comment" @value={=d.comment}/>

    <div> Color (select): </>
    <select class="color" @value={=d.color}>
        $for (let c of colorCodes) {
            <option value={c}> {i18nColors[c]} </>
        }
    </>
    
    <div class="output"> Data model values: </>
    <div>
        <div class="lbl"> comment: </> {d.comment.replace(/\n/g,"\\n")}
    </>
    <div>
        <div class="lbl"> color: </> {d.color}
    </>
}`;

let d = new FormData();
d.comment = "line1\nline2";
d.color = "BL";
main().attach(document.body).render({ d });
