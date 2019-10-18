import { API, defaultParam, required, IvElement, decorator } from './index';


@API class UnsafeInnerHtml {
    @defaultParam html: string = "";
    @required $targetElt: IvElement;
}
export const unsafeInnerHTML = decorator(UnsafeInnerHtml, ($api: UnsafeInnerHtml) => {
    let html = "";
    return {
        $render() {
            if ($api.html !== html) {
                $api.$targetElt.innerHTML = html = $api.html;
            }
        }
    }
});
