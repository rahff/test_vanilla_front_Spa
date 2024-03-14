import {Router, RouterLink} from "./UI/router.js"






function main(){
    customElements.define('router-link', RouterLink);
    const router =  Router.getInstance();
    window.addEventListener('popstate', () => {
        router.navigate(window.location.pathname);
    })
    router.navigate("/");
}

main();