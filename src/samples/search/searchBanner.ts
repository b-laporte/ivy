import { template, API } from '../../iv';
import { IvContent } from '../../iv/types';


@API class SearchBanner {
    searchTerms: string;
    title = "Search";
    ariaLabel = "Search";
    logo: IvContent;
    account: IvContent;
}
export const searchBanner = template(`($:SearchBanner) => {
    <div class="searchBanner">
        <div class="general">
            // applications and account info
            <div class="account"> # # </> // TODO
        </>
        <form class="search">
            <div>
                <div class="logo" @content={$.logo}/>
                <div class="container">
                    <div class="field">
                        <div class="paddingA"> #\ # </>
                        <input type="text" maxlength="2048" name="q" aria-autocomplete="both" 
                            aria-haspopup="false" autocapitalize="off" spellcheck="false"
                            autocomplete="off" autocorrect="off" role="combobox" 
                            title={$.title} aria-label={$.ariaLabel}
                            value={$.searchTerms}
                        />
                        <div class="paddingB"> #\ # </>
                    </>
                    <button type="submit">
                        <span class="searchBtn">
                            <svg focusable="false" @xmlns="svg" style="height:24px;width:24px" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                            </svg>
                        </>
                    </>
                </>
            </>
        </>
    </>
}`);
