import {Router, RouterLink} from "./UI/router.js"

function main(){
    customElements.define('router-link', RouterLink);
    const router =  Router.getInstance();
    router.navigate("/");
}

main();