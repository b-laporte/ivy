// @@extract: import
import { $template } from "../../../iv";

// @@extract: group
const group = $template`(title:string = "", $content:IvContent) => {
    <div class="group"> // groups have a dark-gray border
        $if (title) {
            <div class="title"> {title} </>
        }
        <! @content/>
    </>
}`;

// @@extract: groups
const groups = $template`() => {
    // groups have a dark-gray border
    <*group>
        This group has no title
    </>
    <*group title="Second group">
        This group has a <b> title </b>
    </>
    <*group title="Parent group">
        <*group title="Child group">
            Hello World
        </>
    </>
    <hr/>
}`;

// @@extract: section
const section = $template`($content:IvContent, header:IvContent, footer:IvContent) => {
    <div class="section"> // sections have a blue border
        $if (header) {
            <div class="header" @content={header}/>
        }
        <! @content/>
        $if (footer) {
            <div class="footer" @content={footer}/>
        }
    </>
}`;

// @@extract: sections
const sections = $template`() => {
    // sections have a blue border
    <*section>
        This section has no header & footer
    </>
    <*section>
        <.header> Hello <b> World </b> </>
        This is important information...
    </>
    <*section>
        <.header> Another section </>
        <*group> The section content can contain any elements or sub-templates </>
        $for (let i=1; 4>i; i++) {
            // of course, we can also use any control statement...
            <*group> content #{i} ... </>
        }
        <.footer> (and this is the footer placeholder) </>
    </>
}`;

// @@extract: instantiation
groups().attach(document.body).render();
sections().attach(document.body).render();
