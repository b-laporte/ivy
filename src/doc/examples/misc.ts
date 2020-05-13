import { $template } from '../../iv';
import w from '../widgets';

export const preprocessors = $template`() => {
    <!cdata @@md>
    # pre-processors
    </!cdata>
    <*w.notions>
        <.notion name="<!cdata> sections"> to create text nodes that don't need character escaping and that
        keep all white spaces</>
        <.notion name="xjs pre-processors"> to transform the template AST at compilation time </>
        <.notion name="@@md pre-processor"> to transform cdata text into markdown HTML </>
    </>
    <!cdata @@md="top-desc">
    This example demonstrates how XJS pre-processors can be used to enrich template and fragment strings
    at compilation time. XJS provides 3 pre-processors out-of-the box:
    - [@@extract][] to extract, inject and highlight a typescript section from another file
    - [@@md][] markdown converter: to convert a markdown text into HTML
    - [@@ts][] typescript highlighter: to highlight some typescript text

    ... but of course custom pre-processors can be easily created

    [@@extract]: https://github.com/AmadeusITGroup/xjs/blob/master/docs/pre-processors.md#extract
    [@@md]: https://github.com/AmadeusITGroup/xjs/blob/master/docs/pre-processors.md#md-markdown-converter
    [@@ts]: https://github.com/AmadeusITGroup/xjs/blob/master/docs/pre-processors.md#ts-typescript-highlighter
    </!cdata>
    <*w.demo src="preprocessors" height=220 />
    // @@extract: extract-sample
    <*w.code @@extract="preprocessors/preprocessors.ts#import" indicators="bottom"/>
    // @@extract: extract-sample-end
    <!cdata @@md>
    As you can see, using pre-processors is similar to using decorators - with the only syntactical
    difference that pre-processors take an *@@* prefix instead of a single *@*.

    In this particular case, the **@@md** pre-processor is used on a **\<!cdata>** node, which is 
    special ivy node to create text nodes that don't need character encoding 
    (e.g. the \< character can be used without any ! prefix). Similarly, white spaces are not 
    collapsed in cdata sections - which is perfect for markdown that interprets spaces and new lines.

    Technically, pre-processors are called by the XJS parser once the node they sit upon is fully parsed
    (e.g. the cdata node in this example). Then the pre-processor function will receive this node 
    as argument and will have the possibility to update it (or replace it, in the markdown case).

    That said, pre-processors can sit on any node, like for instance component nodes. Here is another 
    example using the **@@extract** pre-processor that extracts and highlights the code displayed above:
    </!cdata>
    <*w.code @@extract="misc.ts#extract-sample"/>
    <!cdata @@md>
    Last but not least, you may wonder how pre-processors are defined as they are not imported
    in the template file?

    Pre-processors are used by the XJS parser so they need to be passed as arguments to the ivy 
    packager plugin that calls the XJS parser. Here is an extract of the *rollup configuration* 
    used to compile the above example:
    </!cdata>
    <*w.code @@extract="rollup2.config.js#config"/>
}`;

export const todoMVC = $template`() => {
    <!cdata @@md>
    # todo mvc
    Here is the [todomvc][] application implemented with ivy:

    [todomvc]: http://todomvc.com/
    </!cdata>
    <*w.demo src="todomvc" height=800/>
}`;

export const triangles = $template`() => {
    <!cdata @@md>
    # Sierpinski triangles

    This page demonstrates 3 types of parallel updates:
    - a general scale transformation applied on the main triangle every animation frame
    - text node updates every second (the number in the blue dots)
    - text node update on user input (you need to hover one of the blue dots)
    
    (this code derived from the following [stencil demo][sd])
    
    [sd]: https://stencil-fiber-demo.firebaseapp.com
    </!cdata>
    <*w.demo src="triangles" height=770/>
}`;

export const dbMonitor = $template`() => {
    <!cdata @@md>
    # repaint challenge
    This example illustrates ivy repaint capabilities baed on the [repaint rate][dbmon] challenge.

    [dbmon]: https://mathieuancelin.github.io/js-repaint-perfs/
    </!cdata>
    <*w.demo src="dbmon" height=3850/>
}`;
