import { IvContent } from '../../../iv/types';
import { template } from "../../../iv";

// @@extract: pages
const pageA = template(`(count:number, $content:IvContent) => {
    # This is page A / count={count} #
    <br/>
    <! @content/>
}`);

const pageB = template(`(count:number, $content:IvContent) => {
    <div class="blue">
        # This is page B (count={count}) #
        <div class="container" @content/>
    </>
}`);

// @@extract: main
const main = template(`(page, counter=1, $) => {
    if (!page) {
        page = $.page = pageA;
    }
    <button @onclick={=>$.page = pageA}> # page A # </>
    <button @onclick={=>$.page = pageB}> # page B # </>
    <button @onclick={=>$.counter++}> # + # </>

    <div class="page container">
        <*page count={counter+1}>
            <b> # Page content # </> # \(main counter={counter}) #
        </>
    </>
}`);

main().attach(document.body).render();
