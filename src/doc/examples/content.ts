import { xtr } from '../../xtr/xtr';

const hello = xtr`
    <div class="text">
        <h1> Hello World </>
        <p>
            Presentation...
        </>
    </>
    <*code @@extract="hello/hello.ts#all" indicators="top;bottom"/>
    <div class="text">
        <p>
            ...
        </>
    </>
`;

const clock = xtr`
    <div class="text">
        <h1> SVG clock </>
        <p>
            Presentation...
        </>
    </div>
    <*code @@extract="clock/clock.ts#controller"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="clock/clock.ts#clock-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="clock/clock.ts#hand-template"/>
    <div class="text">
        <p>
            Some comment
        </>
    </div>
    <*code @@extract="clock/clock.ts#instantiation"/>
`;

const todo = xtr`
    <div class="text">
        <h1> Under construction </>
        <p>
            Presentation...
        </>
    </>
`;

export default {
    categories: [{
        title: "base concepts",
        code: "base",
        items: [{
            title: "hello world", code: "hello", content: hello
        }, {
            title: "todo1", code: "a", content: todo
        }, {
            title: "todo2", code: "b", content: todo
        }, {
            title: "event-handler", code: "c", content: todo
        }]
    }, {
        title: "advanced",
        code: "advanced",
        items: [{
            title: "SVG Clock", code: "clock", content: clock
        }]
    }]
}

