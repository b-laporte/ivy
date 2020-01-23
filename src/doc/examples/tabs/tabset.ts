import { template, API, Controller, io } from '../../../iv';
import { Data } from '../../../trax';
import { IvContent } from '../../../iv/types';

// @@extract: controller
@Data class Tab {
    id: string;
    title: IvContent;
    $content: IvContent;
}

@API class Tabs {
    @io selection: string;    // id of the selected tab
    tabList: Tab[];
}

@Controller class TabsCtl {
    $api: Tabs;

    $beforeRender() {
        // make sure $api.selection corresponds to a valid tab
        const tabs = this.$api.tabList;
        if (tabs.length > 0) {
            let found = false;
            for (let tab of tabs) {
                if (tab.id === this.$api.selection) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.$api.selection = tabs[0].id;
            }
        }
    }
}

// @@extract: template
export const tabs = template(`($:TabsCtl, $api) => {
    const tabs = $api.tabList, selectedId="";
    let selectedContent=null, isSelected=false;
    <div class="tabs">
        <ul class="header">
            for (let tab of tabs) {
                isSelected = $api.selection === tab.id;
                <li class={"tab " + (isSelected? "selected" : "")} 
                    @onclick={=> $api.selection = tab.id}
                    @content={tab.title}
                />
                if (isSelected) {
                    selectedContent = tab.$content;
                }
            }
        </>
        <div class="content" @content={selectedContent}/>
    </>
}`);
