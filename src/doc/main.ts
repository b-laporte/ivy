import { navbar } from './nav';
import { template } from "../iv";
import './reset.css';
import './layout.css';

const hello = template(`() => {
    <h1> # Hello World # </h1>
    <*navbar/>
}`, navbar);

hello().attach(document.body).render();
