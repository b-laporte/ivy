import { $template } from '../../iv';
import w from '../widgets';


export const forms1 = $template`() => {
    <!cdata @@md>
    # Input bindings
    </!cdata>
    <*w.notions>
        <.notion name="@value decorator"> to bind input and textareas to data models </>
        <.notion name="template uid"> to create unique ids/labels </>
    </>
    <*w.demo src="forms1" height=290/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#data-model"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#form"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#value-import"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms1/forms1.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;

export const forms2 = $template`() => {
    <!cdata @@md>
    # Input binding options
    </!cdata>
    <*w.notions>
        <.notion name="@value debounce parameter"> to delay change events and prevent bursting </>
        <.notion name="@value events"> to specify which events should be used (on top of "change") </>
    </>
    <*w.demo src="forms2" height=290/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms2/forms2.ts#form"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms2/forms2.ts#options"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms2/forms2.ts#options-editor"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;

export const forms3 = $template`() => {
    <!cdata @@md>
    # Input bindings data conversion
    </!cdata>
    <*w.notions>
        <.notion name="@value input2data & data2input"> to convert data between input and data model </>
    </>
    <*w.demo src="forms3" height=200/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms3/forms3.ts#data-model"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms3/forms3.ts#template"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="forms3/forms3.ts#conversions"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;

export const select = $template`() => {
    <!cdata @@md>
    # Textarea and Select
    </!cdata>
    <*w.notions>
        <.notion name="@value for textarea and select elements"/>
    </>
    <*w.demo src="select" height=290/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="select/select.ts#main"/>
}`;
