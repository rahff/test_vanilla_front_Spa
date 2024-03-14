import {Router, RouterLink} from "./app/router.js"
import {FormControl} from "./app/components/FormControl.js";
import {routes} from "./app/routes.js";

function main(){
    customElements.define('router-link', RouterLink);
    customElements.define('form-control', FormControl, { extends: 'input' })
    const router =  Router.getInstance(routes);
    router.navigate("/");
}

main();