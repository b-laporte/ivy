import { $template } from '../../iv';
import w from '../widgets';


export const forms1 = $template`() => {
    <div class="text">
        <h1> Input bindings </>
        <*w.notions>
            <.notion name="@value decorator"> to bind input and textareas to data models </>
            <.notion name="template uid"> to create unique ids/labels </>
        </>
    </>
    <*w.code @@extract="forms1/forms1.ts#data-model"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms1/forms1.ts#form"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms1/forms1.ts#value-import"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms1/forms1.ts#main"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

export const forms2 = $template`() => {
    <div class="text">
        <h1> Input binding options </>
        <*w.notions>
            <.notion name="@value debounce parameter"> to delay change events and prevent bursting </>
            <.notion name="@value events"> to specify which events should be used (on top of "change") </>
        </>
    </>
    <*w.code @@extract="forms2/forms2.ts#form"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms2/forms2.ts#options"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms2/forms2.ts#options-editor"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

export const forms3 = $template`() => {
    <div class="text">
        <h1> Input bindings data conversion </>
        <*w.notions>
            <.notion name="@value input2data & data2input"> to convert data between input and data model </>
        </>
    </>
    <*w.code @@extract="forms3/forms3.ts#data-model"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms3/forms3.ts#template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*w.code @@extract="forms3/forms3.ts#conversions"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
}`;

export const select = $template`() => {
    <div class="text">
        <h1> Textarea and Select </>
        <*w.notions>
            <.notion name="@value for textarea and select elements"/>
        </>
    </>
    <*w.code @@extract="select/select.ts#main"/>
}`;
