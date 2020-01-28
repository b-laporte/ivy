
// @@extract: all
import { template, ζinit, ζend, ζelt, ζtxt, ζe, ζΔD, ζΔfStr, ζΔp, ζt } from "../../../iv";

const hello = (function () {
const ζs0 = {}, ζs1 = ["class", "hello"], ζs2 = [" Hello ", "", "! "];
@ζΔD class ζParams {
    ΔΔname: string; @ζΔp(ζΔfStr) name: string;
}
return ζt("hello", "hello/hello.ts", ζs0, function (ζ, $, $api) {
    let name = $api["name"];
    let ζc = ζinit(ζ, ζs0, 2);
    ζelt(ζ, ζc, 0, 0, "div", 1, 0, ζs1);
    ζtxt(ζ, ζc, 0, 1, 1, 0, ζs2, 1, ζe(ζ, 0, name));
    ζend(ζ, ζc);
}, ζParams);
})();

hello().attach(document.body).render({ name: "World" });