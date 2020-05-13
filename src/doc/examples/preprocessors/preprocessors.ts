// @@extract: import
import { $template } from "../../../iv";

const demo = $template`(name:string) => {
    <div class="demo">
        <!cdata @@md>
        # markdown preprocessor
        This text was generated through the **[xjs][]** markdown **pre-processor** 
        (documentation [here][md]).

        [xjs]: https://github.com/AmadeusITGroup/xjs
        [md]: https://github.com/AmadeusITGroup/xjs/blob/master/docs/pre-processors.md
        
        (pre-processor are called at compilation time and can modify the XJS AST)
        </!cdata>
        // back to HTML - markdown is not supported here any more
        # end (not markdown)
    </div>
}`;

demo().attach(document.body).render();