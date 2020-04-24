
import { IvContent } from '../../../iv/types';
import { $template, API } from "../../../iv";

export const privacy = $template`($content:IvContent, remindCaption="Remind me later", reviewCaption="Review") => {
    <div class="privacy row">
        <div class="cell">
            <div class="privacy_icon"/>
        </>
        <div class="cell">
            <div class="msg" aria-level="3" role="heading" @content/>
            <div class="buttons">
                <button class="flat" @onclick={=>handleResponse(1)}> {remindCaption} </>
                !s!s
                <button class="raised" @onclick={=>handleResponse(2)}> {reviewCaption} </>
            </>
        </>
    </>
}`;

function handleResponse(value: 1 | 2) {
    alert("TODO - Privacy message: manage response " + value);
}

// google code associated to the privacy module
// (function () {
//     var urgencyLevel = 2;
//     var wcdt = -1;
//     (function () {
//         var c = (this || self).JSON.parse;
//         var f = function (a) {
//             try {
//                 var b = window.localStorage.getItem("cns;;" + a);
//                 if (b) {
//                     var d = b.indexOf("_");
//                     var e = 0 > d ? null : c(b.substr(d + 1))
//                 } else e = null;
//                 return e
//             } catch (l) { }
//             return null
//         };
//         try {
//             var g = (parseInt(f("u"), 10) || 0) < urgencyLevel;
//             if (0 < wcdt) {
//                 var h = parseInt(f("d"), 10) || 0;
//                 g = google.time() - h > wcdt
//             }
//             if (null == document.cookie.match("(^|;)\\s*CONSENT=YES\\+") && g) {
//                 var k = document.querySelector("#cnso");
//                 k && (k.style.display = "block", k.removeAttribute("aria-hidden"))
//             }
//         } catch (a) {
//             google.ml(a, !0, { src: "cnso" })
//         };
//     }).call(this);
// })();