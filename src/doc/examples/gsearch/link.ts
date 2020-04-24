import { IvContent } from '../../../iv/types';
import { $template, API } from "../../../iv";

export const link = $template`(href:string, ved:string, $content:IvContent) => {
    <a href={href} 
        ping={"/url?sa=t&amp;source=web&amp;rct=j&amp;url="+encodeURI(href)+"&amp;ved="+ved}
        @content={$content}/>
}`;
