import { IvTemplate } from '../../../iv/types';
import { template } from "../../../iv";

const sub1 = template(`(arg1: number) => {
    <div>
        # This is a subtemplate A: {arg1} #
    </>
}`);

const sub2 = template(`(arg1: number) => {
    <div>
        # This is a subtemplate B: {arg1} #
    </>
}`);

const wrap = template(`(templ: IvTemplate = sub1) => {
    <div> # This is a wrapper! # </>
    <*templ arg1={10}/>;
}`, sub1);


// @@extract: main
const main = template(`() => {
    <*wrap/>
    <*wrap templ={sub2}/>
}`, wrap, sub2);

main().attach(document.body).render();
