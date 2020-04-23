import { $template, API, Controller } from '../../../iv';
import { IvEventEmitter } from '../../../iv/events';
import { value } from "../../../iv/inputs";

// @@extract: data-definition
@API class Range {
    placeholder: number;
    min:number;
    max:number;
    selectEmitter: IvEventEmitter;
}

// @@extract: controller
@Controller class RangeCtl {
    $api: Range;
    value: number;

    async $init() {
        this.value = this.$api.placeholder;
    }

    select() {
        this.$api.selectEmitter.emit(this.value);
    }
}

// @@extract: template
export const range = $template`($:RangeCtl) => {
    <div class="range">
        <input type="range"
            min={$.min}
            max={$.max}
            @value={=$.value}
            @onmouseup={=>$.select()}
            @ontouchend={=>$.select()}/>
        <div class="current" style="color: gray">
            Current value: {$.value}
        </div>
    </>
}`;

const main = $template`(message='', $) => {
    <*range placeholder=30 min=0 max=100
        @onselect={e=>$.message='Selected value: ' + e.data}
    />
    <div class="selected"> {message} </>
}`;

main().attach(document.body).render();
