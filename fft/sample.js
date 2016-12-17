/**
 * Sketch pad - draft for future syntax
 * Created by blaporte on 31/03/16.
 * Copyright Bertrand Laporte 2016
 */

// ########
import {b} from 'bootstrap';

var pkg = iv `
    <import b=${b}/>
    
    <function #widgetSamples alerts data>
        <b:accordion>
            <:panel title="simple" ref="a">
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus 
            </:panel>
            <:panel ref="b">
                <:title> &#9733; <b>Fancy</b> title </:title>
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus 
            </:panel>
        </b:accordion>
        
        % for (let alert in alerts) {
            <b:alert [type]=alert.type onclose($alert)=closeAlert($alert)>{{ alert.message }}</b:alert>
        % }
        
        <b:radioGroup #radioBasic [[model]]=data.radioGroupModel>
            <:button class="primary" value="1"> Left (pre-checked) </:button>
            <:button class="primary" value="middle"> Middle </:button>
            <:button class="primary" value="false"> Right </:button>
        </b:radioGroup>
        
        <b:carousel interval=1000 wrap=false>
            <:slide>
                <img src="http://lorempixel.com/900/500?r=1" alt="Random first slide">
                <:caption>
                  <h3>First slide label</h3>
                  <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                </:caption>
            </:slide>
            <:slide>
                <img src="http://lorempixel.com/900/500?r=3" alt="Random second slide">
                <:caption>
                  <h3>Second slide label</h3>
                  <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                </:caption>
            </:slide>
        </b:carousel>
        
        <b:collapsible collapsed=isCollapsed>
          <div class="card">
            <div class="card-block">
              You can collapse this card by clicking Toggle
            </div>
          </div>
        </b:collapsible>
        
        <b:datepicker [[model]]=data.mydate placeholder="yyyy-mm-dd" [markDisabled]=isDisabled>
            <:customDay>
             <function date currentMonth selected disabled>
                <span class="custom-day" 
                    [class.weekend]=isWeekend(date) 
                    [class.bg-primary]=selected 
                    [class.hidden]=date.month!==currentMonth 
                    [class.text-muted]=disabled>
                    {{ date.day }}
                </span>
              </function>
            </:customDay>
        </b:datepicker>
        
    </function>
 `

var pkg2 = iv `
    <import b=${b}/>
    <func #another>
        <b:datepicker [[model]]=data.mydate placeholder="yyyy-mm-dd" [markDisabled]=isDisabled customDay=myCustomDay/>
        
        <b:dropdownMenu #dropdownMenu1 onclick(e,ref)=doAction(ref)>
            <:label> Choose your option </:label>
            <:separator/>
            <:button ref=1>Action - 1</:button>
            <:button ref=2>Another <b>action</b> </:button>
            <:button ref=3 enabled=false> Another action </:button>
            % for (var i=0;list.length>i;i++) {
                <:button ref=i> {{list[i].label}} </:button>
            % }
        </b:dropdownMenu>
        
        <b:popover #popContent>
            <:header> Some header content with a <a href=""> link </a>! </:header>
            Some content...
        </b:popover>
        
        // TODO need for custom class to avoid repeating inline attributes
        <b:poplink target=popContent trigger="hover" delay=200> Hover me! </b:poplink>
        
        <div @b:popover={target:popContent, trigger:"hover", delay:200}> Hover me! </div>
    </func>
    
    <func #myModal close:Function dismiss:Function>
        <b:modal resizeable=true>
            <:header>
                <button type="button" class="close" aria-label="Close" onclick()=dismiss('Cross click')>
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title">Modal title</h4>
            </:header>
            
            <p>One fine body&hellip;</p>
            
            <:footer>
                <button type="button" class="btn btn-secondary" onclick()=close('Close click')>Close</button>
            </:footer>
        </b:modal>
    </func>
`;

