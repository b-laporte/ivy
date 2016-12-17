
// cf. http://codepen.io/timothyrourke/pen/wojke

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class IntroState {
    constructor() {
        this.nbrOfTeeth=12;
        this.step=0; // from 0 to 2
    }
}

var ipk = iv`
    <!-- cf. codepen.io/timothyrourke/pen/wojke -->
    // step 0: buttons only
    // step 1: main gear
    // step 2: all teeth
    // step 3: (reset) all teeth deleted -> then move to 0
    <def #gears $c:${IntroState}>
        <div>
            <button caption="Start the animation" onclick()=c.step=1/>
            <button caption="Stop the animation" onclick()=c.step=0/>
            
            % if (c.step>0) {
                <div #gear>
                    % if (c.step>1) for (var i=0;c.nbrOfTeeth>i;i++) {
                        <div index=i class="gearTooth"> </div>
                    % }
                </div>
            % }
        </div>
    </def>

    <def #intro c:${IntroState} dom:IvNode>
        <group dom=dom>
            <track>
                // main gear entry: zoom out and trigger step
                <animate element="#gear" target.radius=[0,20] easing="ease-in" duration=200/> // dom inherited from parent
                <process action()={c.step=2}/>
            </track>
            <track>
                <wait until()={return c.step===2;}/>
                // teeth entry and rotation
                <group>
                    % var teeth = dom.select(".gearTooth"); 
                    % for (var k in teeth) {
                        <track>
                            // animate from random to position in circle
                            % var xPos = getRandomInt(-400,400), yPos = getRandomInt(-400,400);
                            <animate element=teeth[k] target={tranlateX:xPos,translateY:[0,yPos],rotateZ:i*30} duration=1000 easing="ease"/>
                        </track>
                    % }
                </group>
                <wait duration=500/>
                % if (step < 3) {
                    <repeat>
                        <animate element="#gear" target.rotateZ=3000 easing="ease" duration=2000/>
                    </repeat>
                % }
            </track>
            <:track>
                <wait until()={return c.step===3;}
                // exit: elarge radius position for each touch, then fall down
            </:track>
        </group>
    </def>
`;


var sample = iv`
    <animate ":changed" duration=300 easing="easeIn"/>
    // possible pseudo classes:
    // :new : new elements in endState state only (equivalent to :new:endState)
    // :deleted deleted elements in startState that are deleted in endState state only (equivalent to :deleted:startState)
    // :updated updated elements only (i.e. present in A and B state, but changed)
    // :updated:startState : updated elements in A state (means element should be considered as dissociated and A part should be deleted)
    // :updated:endState : updated elements in B state (means element should be considered as dissociated and A part should be deleted)
    // :changed all elements that change (new, deleted, updated)
    // :changed:startState deleted and updated elements in A state (dissociated)
    // :changed:endState new and updated elements in B state (dissociated)
    // :unchanged
    // :unchanged:startState
    // :unchanged:endState
    // :startState all elements in a state (dissociated)

    // animate with keyframes
    <animate elt="#btn" duration=300 easing="ease"> // default easing for each frame?
        <:keyframe pos=0 target.color="#000000"/>
        <:keyframe pos=0.3 target={color:"#00F0F0", opacity:0.5}/>
        <:keyframe pos=1 target={color:"#F0F0F0", opacity:1}/>
    </animate>
`;

var animationdef = iv`
    <elt #group                     // allows to group multiple animatinons and define multiple parallel tracks
        dom:IvNode                  // virtual dom context - contains the element to animate. Will be inherited from parent if not provided
        $content:IvNode             // default track if only one track (no tracks should be provided)  
    />
    
    <elt #track $content:Ivnode/>
    
    <elt #animate
        elt:IvNode
        elts:[IvNode]
        props:{}
        easing:String
        duration:Number
        dom:IvNode
        $c:${AnimateController}
        $content:[foo,bar,baz]
    />
    
    <elt #set
        element:IvNode
        elements:[IvNode]
        target:{}
        dom:IvNode
    />
    
    <elt #wait
        during:Number
        until():Function
    />
    
    <elt #repeat
        until():Function
        times:Number
        revert:Boolean
    />
    
    
    <att #select.msg $content:IvNode/>
    <att #select.separator/>
    <att #select.option ref:String $content/>
    <func #select $content:[foo,bar,baz]/>
`;

