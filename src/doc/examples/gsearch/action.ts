import { IvContent } from '../../../iv/types';
import { $template, API } from "../../../iv";
import { Data } from '../../../trax';


@Data class Action {
    href: string;
    q:string;
    ved: string;
}

@API class ActionMenu {
    actionList: Action[];
}
export const actionMenu = $template`($:ActionMenu) => {
    V
}`;
