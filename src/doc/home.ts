import { xtr } from '../xtr/xtr';

export default xtr`
    <div class="home layout">

        <div class="blockA">
            <div class="row1"/>
            <div class="row2">
                <div class="mainA">
                    <div class="mainLogo">
                        <*ivyLogo className="ivyLogoMain"/>
                        <div> rethinking web development </>
                    </>
                </>
                <div class="mainB">
                    <div class="features">
                        <p> flexible </>
                        <p> reactive </>
                        <p> typescript-based </>
                        <p> efficient </>
                        <p> easy ! </>
                    </>
                </>
            </>
            <div class="row3">
                <*infoBlock title="easy" className="variantA" proportions="2;1;9;0.5">
                    Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries
                </>

                <*infoBlock title="typescript-based" className="variantB" proportions="1;4;7;2">
                    Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries
                </>

                <*infoBlock title="template functions" className="variantC" proportions="1.4;2.5;8;0.2">
                    Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries
                </>

                <*infoBlock title="advanced components" className="variantD" proportions="1.8;2.5;6;1">
                    Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries
                </>

                <*infoBlock title="fully reactvie" className="variantB" proportions="1;2;7;.7">
                    Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries
                </>
            </>
        </>
        <div class="blockB">
            <div class="row1"/>
            <div class="row2">
                <div class="headline">
                    <div>
                        <span class="highlight"> ivy is a set of libraries to build </span><br/>
                        <span class="highlight"> advanced web interfaces </>
                    </>
                    <p class="details">
                        based on 3 pillars: a <b> JS template engine,</> a <b> state managmenent </> solution (aka. trax)
                        and a flexible <b> template syntax </> (aka. XJS).
                    </>
                </>
            </>
            <div class="row3">
                <div class="sideblock">
                    <h1> Compared to... </>
                    <p>
                        Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries
                    </>
                </>
            </>
        </>

    </>
`;
