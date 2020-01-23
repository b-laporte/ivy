import { template, API, Controller } from '../../../iv';

async function delay(time: number = 100) {
    return new Promise((r) => {
        setTimeout(r, time);
    });
}

document.getElementById("reload")!.addEventListener("click", () => {
    // reload button
    location.reload();
});

// @@extract: controller
// example adapted from https://svelte.dev/examples#onmount
@API class Photos {
    url: string; // e.g. <*photos url="https://foo.com/photos?_limit=20"/>
}

@Controller class PhotosCtl {
    $api: Photos;
    photos?: any[]; // interface types not supported yet

    async $init() {
        // $api is initialized before $init is called
        await delay(500); // slow-down the process to see the loading indicator
        const res = await fetch(this.$api.url);
        this.photos = await res.json();
    }
}

// @@extract: template
const photos = template(`($:PhotosCtl) => {
    const photos = $.photos;
    <div class="photos">
        if (photos === undefined) {
            <div class="loading"> # loading... # </>
        } else if (photos.length === 0) {
            <div class="no_results"> # no photos # </>
        } else {
            for (let photo of photos) {
                <figure>
                    <img src={photo.thumbnailUrl} alt={photo.title}/>
                    <figcaption> #{photo.title}# </>
                </>
            }
        }
    </>
}`);

// @@extract: main
const main = template(`() => {
    <*photos url="https://jsonplaceholder.typicode.com/photos?_limit=4"/>
}`);

main().attach(document.body).render();
