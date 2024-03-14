import {Router, RouterLink} from "./UI/router.js"
import {FormControl} from "./UI/components/FormControl.js";

function main(){
    customElements.define('router-link', RouterLink);
    customElements.define('form-control', FormControl, { extends: 'input' })
    const router =  Router.getInstance();
    router.navigate("/");
}

main();