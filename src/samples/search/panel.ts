import { template, API } from '../../iv';
import { Data } from '../../trax';
import { IvContent } from '../../iv/types';
import { box } from './boxes';

@Data class HeaderImg {
    href: string;
    alt: string;
    src: string;
    height: number;
    width: number;
}
@Data class PanelHeader {
    title: IvContent;
    subTitle: IvContent;
    img?: HeaderImg;
}
@Data class PanelFact {
    title: string;
    $content: IvContent;
}
@Data class PanelThumbnailImg {
    href: string;
    ved: string;
    src: string;
    width: number;
    height: number;
    alt: string;
    $content: IvContent;
}
@Data class PanelThumbnails {
    title: string;
    moreTitle: string;
    moreURL: string;
    moreVed: string;
    imgList: PanelThumbnailImg[];
}
@API class Panel {
    header: PanelHeader;
    description: IvContent;
    factList: PanelFact[];
    thumbnailsList: PanelThumbnails[];
}
export const panel = template(`($:Panel)=>{
    <div class="panel">
        let h=$.header;
        if (h) {
            let titleWidth = 380-parseInt(h.img.width,10),
                titlePaddingTop = parseInt(h.img.height,10) / 2 - 50;
            if (titlePaddingTop<10) titlePaddingTop = 10;
            <div class="header">
                <*box class="sidePanelTitle">
                    <.cell>
                        <div class="title" 
                            style={"width:"+titleWidth+"px;padding-top:"+titlePaddingTop+"px"}
                            @content={h.title}/>
                        <div class="subTitle" @content={h.subTitle}/>
                    </>
                    <.cell>
                        // todo: link
                        <div class="share" style={"padding:"+(titlePaddingTop+8)+"px 8px 0 8px"}>
                            <svg focusable="false" @xmlns="svg" viewBox="0 0 24 24" style="width:24px;height:24px">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"></path>
                            </svg>
                        </>
                    </>
                    if (h.img) {
                        let img=h.img;
                        <.cell>
                            <a href={img.href} alt={img.alt}>
                                <img src={img.src} height={img.height} width={img.width}/>
                            </>
                        </>
                    }
                </>
            </>
        }
        if ($.description) {
            <div class="description" @content={$.description}/>
        }
        if ($.factList && $.factList.length) {
            for (let fact of $.factList) {
                <div class="fact">
                    <div class="title"> #{fact.title}:# </>
                    <div class="content" @content={fact.$content} /> 
                </>
            }
        }
        if ($.thumbnailsList && $.thumbnailsList.length) {
            for (let tn of $.thumbnailsList) {
                <*thumbnails data={tn}/>
            }
        }
    </>
}`);

const thumbnails = template(`(data:PanelThumbnails) => {
    let moreFullURL = data.moreURL+"&ved="+data.moreVed;
    <div class="thumbnails">
        <div class="title">
            <a href={moreFullURL} >
                #{data.title}#
            </>
        </>
        <div class="more">
            <a href={moreFullURL} >
                <span> #{data.moreTitle}# </span>
            </>
        </>
        <div class="list">
            <*box>
                for (let img of data.imgList) {
                    <.cell class="tn">
                        <div class="img">
                            <img src={img.src} 
                                height={img.height} 
                                width="72"
                                style={"margin-top:-"+(Math.floor((img.height-72)/2))+"px"} 
                            />
                        </>
                        <div class="legend" @content={img.$content}/>
                    </>
                }
            </>
        </>
    </>
}`);

