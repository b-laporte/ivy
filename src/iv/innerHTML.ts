import { API, defaultValue, required, IvElement, decorator } from './index';


@API class UnsafeInnerHtml {
    @defaultValue html: string = "";
    @required $targetElt: IvElement;
}
export const unsafeInnerHTML = decorator(UnsafeInnerHtml, (api: UnsafeInnerHtml) => {
    let html = "";
    return {
        $render() {
            if (api.html !== html) {
                api.$targetElt.innerHTML = html = api.html;
            }
        }
    }
});
