import { Data } from '../../trax';
import { API, template } from '../../iv';
import { IvContent } from '../../iv/types';

@Data class Cell {
    class: string = "";
    vAlign: string = "top";
    $content: IvContent;
}
@API class Box {
    class: string = "";
    vAlign: string = "top";
   cellList: Cell[];
}
export const box = template(`($api:Box)=>{
    <div class={"boxes "+$api.class} style={"vertical-align:"+$api.vAlign} >
        for (let c of $api.cellList) {
            <div class={"box "+c.class} style={"vertical-align:"+c.vAlign} @content={c.$content}/>
        }
    </>
}`);
