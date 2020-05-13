import { $template } from '../../iv';
import w from '../widgets';

export const innerHTML = $template`() => {
    <!cdata @@md>
    # unsafe innerHTML
    </!cdata>
    <*w.notions>
        <.notion name="@unsafeInnerHTML"> to (unsafely) inject an html string into an element </>
    </>
    <*w.demo src="innerHTML" height=200/>
    <*w.code @@extract="innerHTML/innerHTML.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="innerHTML/innerHTML.ts#innerHTML-import"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;

export const fragment1 = $template`() => {
    <!cdata @@md>
    # $fragment strings
    </!cdata>
    <*w.notions>
        <.notion name="$fragment strings"> to define safe HTML fragments that can be dynamically downloaded & rendered </>
        <.notion name="@fragment"> to safely inject !$fragment content in an element </>
        <.notion name="@fragment context"> to specify which references are accessible to !$fragments </>
    </>
    <*w.demo src="fragment1" height=240/>
    <*w.code @@extract="fragment1/fragment1.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="fragment1/fragment1.ts#fragment-import"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="fragment1/fragment1.ts#context"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="fragment1/fragment1.ts#alert"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;

export const fragment2 = $template`() => {
    <!cdata @@md>
    # dynamic @fragment
    </!cdata>
    <*w.notions>
        <.notion name="special characters" />
        <.notion name="cdata sections"/>
    </>
    <*w.demo src="fragment2" height=200/>
    <*w.code @@extract="fragment2/fragment2.ts#main"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="fragment2/fragment2.ts#content"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="fragment2/fragment2.ts#context"/>
    <!cdata @@md>
    ...
    </!cdata>
    <*w.code @@extract="fragment2/fragment2.ts#alert"/>
    <!cdata @@md>
    ...
    </!cdata>
}`;
