import { $template } from '../../iv';
import w from '../widgets';

export const controller1 = $template`() => {
    <div class="text">
        <h1> Template controllers & APIs </>
        <*w.notions>
            <.notion name="@Controller"> to define private state and methods associated to a template </>
            <.notion name="$api property"> to define the public api associated to a controller </>
        </>
        ...
    </>
    <*w.code @@extract="controller1/controller1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller1/keypad.ts#data-definition"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller1/keypad.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller1/keypad.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

export const controller2 = $template`() => {
    <div class="text">
        <h1> I/O params </>
        <*w.notions>
            <.notion name="@io params"> to define params that are both input and output </>
            <.notion name="2-way biding expressions"> e.g. !{=x.y!} </>
            <.notion name="setting or removing attributes"> e.g. to enable or disable an input or button </>
        </>
        ...
    </>
    <*w.code @@extract="controller2/controller2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller2/keypad.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="controller2/keypad.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

export const photos = $template`() => {
    <div class="text">
        <h1> Life-cycle hooks </>
        <*w.notions>
            <.notion name="life-cycle hooks"> to define specific hooks on the template controller </>
            <.notion name="$init hook"> to perform some initialization when all parameters are defined </>
        </>
    </>
    <*w.code @@extract="photos/photos.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="photos/photos.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="photos/photos.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

export const tabs = $template`() => {
    <div class="text">
        <h1> Parameter nodes lazy loading </>
        <*w.notions>
            <.notion name="content lazy loading"> to avoid heavy processing in unused $content and parameter nodes </>
            <.notion name="$beforeRender & $afterRender hooks"> to perform some processing before / after render </>
        </>
    </>
    <*w.code @@extract="tabs/tabs.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="tabs/tabs.ts#heavyComponent"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="tabs/tabset.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="tabs/tabset.ts#template"/>
}`;

export const labels1 = $template`() => {
    <div class="text">
        <h1> Labels </>
        <*w.notions>
            <.notion name="#labels"> as a mean to get a reference to dom elements </>
            <.notion name="query() method"> to retrieve template elements that have been rendered </>
        </>
    </>
    <*w.code @@extract="labels1/labels1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels1/labels1.ts#focusTitle"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels1/labels1.ts#focus3rd"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels1/labels1.ts#focusNext"/>
}`;

export const labels2 = $template`() => {
    <div class="text">
        <h1> !$template injection </>
        <*w.notions>
            <.notion name="$template injection"> to access the IvTemplate API in the rendering function or in the template controller </>
            <.notion name="query() from controller methods"/>
        </>
    </>
    <*w.code @@extract="labels2/labels2.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels2/labels2.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels2/labels2.ts#controller"/>
}`;

export const labels3 = $template`() => {
    <div class="text">
        <h1> Component API methods </>
        <*w.notions>
            <.notion name="API methods"> to expose public methods to component callers </>
            <.notion name="#labels on components"> to retrieve a component's api </>
        </>
    </>
    <*w.code @@extract="labels3/labels3.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels3/labels3.ts#actions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="labels3/labels3.ts#item-component"/>
}`;

export const clock = $template`() => {
    <div class="text">
        <h1> SVG clock </>
        <*w.notions>
            <.notion name="SVG"> as any other HTML elements </>
            <.notion name="$dispose"> life cycle hook </>
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#clock-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#hand-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="clock/clock.ts#instantiation"/>
}`;