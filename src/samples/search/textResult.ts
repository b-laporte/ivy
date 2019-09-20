import { IvContent } from './../../iv/types';
import { template, API } from "../../iv";
import { Data } from '../../trax';

@Data class TextResultSubTile {
    $content: IvContent
}

@Data class TextResultTile {
    href: string;
    ved: string;
    subtitle?: TextResultSubTile;
    $content: IvContent;
}

@Data class TextResultFact {
    title: string;
    $content: IvContent;
}

@Data class TextResultMore {
    ved: string;
    $content: IvContent;
}

@Data class TextResultSimilar {
    ved: string;
    keywords: string;
}

@API class TextResult {
    title?: TextResultTile;
    factList: TextResultFact[];
    moreList: TextResultMore[];
    similarList: TextResultSimilar[];
    $content: IvContent;
}
export const textResult = template(`($api:TextResult) => {
    <div class="textResult">
        <div>
            <*title data={$api.title}/>
            <div class="content"> // class="s" 
                <! @content={$api.$content}/>
                <*facts dataList={$api.factList}/>
                <*more dataList={$api.moreList}/>
            </>
            <div data-base-uri="/search">
                <div class="similar" style="display:none">
                    if ($api.similarList) {
                        for (let similar of $api.similarList) {
                            <div data-ved={similar.ved}> #{similar.keywords}# </div>
                        }
                    }
                </>
            </>
        </>
    </>
}`);

const title = template(`(data?:TextResultTile)=>{
    if (data) {
        <div class="title"> // class="r"
            // Main title
            <a href={data.href}> // todo: add ping="xxx"
                <h3><div class="ellip" @content={data.$content}/></h3>
                if (data.subtitle) {
                    <div class="subtitle">
                        <cite @content={data.subtitle.$content}/>
                    </div>
                }
            </a>
        </>
    }
}`);

const facts = template(`(dataList?:TextResultFact[]) => {
    if (dataList && dataList.length>0) {
        let len = dataList.length;
        <div class="facts"> // class="P1usbc"
            for (let i=0;len>i;i+=2) {
                <div class="row"> // class="VNLkW"
                    <*fact item={dataList[i]}/>
                    if (i+1<len) {
                        <*fact item={dataList[i+1]}/>
                    }
                </>
            }
        </>
    }
}`);

const fact = template(`(item:TextResultFact) => {
    <div class="fact cell">
        <b> #{item.title}# </b> # \: #
        <! @content={item.$content}/>
    </div>
}`);

const more = template(`(dataList?:TextResultMore[]) => {
    if (dataList && dataList.length>0) {
        <div class="more">
            let len=dataList.length;
            for (let i=0;len>i;i++) {
                <! @content={dataList[i].$content}/> 
                if (i<len-1) {
                    # · #
                }
            }
        </>
    }
}`);

// e.g. <*rating value=4.7 max=5 alt="Rated 4.5 out of 5"> Rating: 4.7 - ‎84 votes </>
export const rating = template(`(value:number, max:number, $content:IvContent, alt:string) => {
    <div class="rating">
        <span style="width:59px" role="img" aria-label={alt}/>
        <span class="text" @content/>
    </>
}`);
// <g-review-stars><span class="fTKmHE99XE4__star-default" role="img"
//         aria-label="Rated 4.5 out of 5,"><span style="width:59px"></span></span></g-review-stars>
// Rating: 4.7 - ‎84 votes