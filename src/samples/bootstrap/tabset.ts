
import { $component, $dataNode, $dataNodes, $initProps, $refresh } from "../../iv";

let nextId = 0;

class BsTabSet {
    props: {
        activeId: string;           // Id of the currently active tab
        type: 'tabs' | 'pills';     // Type of navigation to be used for tabs. Can be one of 'tabs' or 'pills'
        orientation: 'horizontal' | 'vertical'; // The orientation of the nav (horizontal or vertical). Default is 'horizontal'.
        justify: 'start' | 'center' | 'end' | 'fill' | 'justified'; // The horizontal alignment of the nav with flexbox utilities. Default is 'start'.
        destroyOnHide: boolean;     // Whether the closed tabs should be hidden without destroying them
    }

    init() {
        $initProps(this, {
            activeId: "",
            type: "tabs",
            orientation: "horizontal",
            justify: "start",
            destroyOnHide: true
        });
    }

    render() {
        `---
        % let p = this.props, tabs = $dataNodes("tab");
        % this.initTabs(tabs);
        % this.checkActiveId(tabs);
        <div a:class="ngb-tabset">
            <ul a:role="tablist" [a:class]=('nav nav-' + p.type + ' ' + (p.orientation==='horizontal'?  this.getJustifyClass() : 'flex-column'))>
                % for (let tab of tabs) {
                    % let tp = <any>tab.props, title = $dataNode("title", tab), isActive=(tp.id === p.activeId);
                    <li a:class="nav-item">
                        <a a:id=tp.id a:class="nav-link" [className.active]=isActive [className.disabled]=tp.disabled 
                            a:href="" onclick(e)=this.select(tp.id, tabs, e) a:role="tab" [a:tabindex]=(tp.disabled ? '-1': undefined)
                            [a:aria-controls]=(!p.destroyOnHide || isActive ? tp.id + '-panel' : null)
                            [a:aria-expanded]=isActive [a:aria-disabled]=tp.disabled>
                            <ins:title/>
                        </a>
                    </li>
                % }
            </ul>
            <div a:class="tab-content">
                % for (let tab of tabs) {
                    % let id = tab.props["id"],  isActive = id === p.activeId;
                    % if (isActive || !p.destroyOnHide) {
                        <div a:role="tabpanel" [a:id]=(id+"-panel") a:class="tab-pane" [className.active]=isActive 
                            [a:aria-labelledby]=id [a:aria-expanded]=isActive>
                            <ins:tab/>
                        </div>
                    % }
                % }
            </div>
        </div>
        ---`
    }

    checkActiveId(tabs) {
        // auto-correct activeId that might have been set incorrectly as input
        let p = this.props, activeTab = this.getTabById(tabs, p.activeId);
        p.activeId = activeTab ? p.activeId : (tabs.length ? tabs[0].props.id : null);
    }

    getTabById(tabs, id) {
        for (let tab of tabs) {
            if (tab.props.id === id) {
                return tab;
            }
        }
        return null;
    }

    initTabs(tabs) {
        for (let tab of tabs) {
            if (!tab.$initialized) {
                $initProps(tab, {
                    id: "ngb-tab-" + nextId++,
                    disabled: false
                });
                tab.$initialized = true;
            }
        }
    }

    getJustifyClass() {
        let justify = this.props.justify;
        if (justify === 'fill' || justify === 'justified') {
            return `nav-${justify}`;
        } else {
            return `justify-content-${justify}`;
        }
    }

    select(tabId: string, tabs, evt) {
        let selectedTab = this.getTabById(tabs, tabId);
        evt.preventDefault();
        if (selectedTab && !selectedTab.props.disabled && this.props.activeId !== tabId) {
          let defaultPrevented = false;

          
        //   this.tabChange.emit(
        //       {activeId: this.activeId, nextId: tabId, preventDefault: () => { defaultPrevented = true; }});

          if (!defaultPrevented) {
            this.props.activeId = tabId;
            $refresh(this);
          }
        }
    }

}

export let tabset = $component(BsTabSet);
