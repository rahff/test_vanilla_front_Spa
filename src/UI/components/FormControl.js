export class FormControl extends HTMLInputElement {
    #validator;
    #currentError = null;
    #divError;
    constructor() {
        super();
        this.addEventListener("input", (event) => {
            this.#currentError = this.#validator.fn(event.target.value);
            if(this.#currentError) this.#showErrorOnParent(this.#currentError);
            else this.#removeErrorMessage();
        })
    }

    #showErrorOnParent(error){
        if(this.#currentError && !this.#divError){
            this.#divError = document.createElement("div");
            this.#divError.innerHTML = this.#validator.template(error.message)
            this.parentElement.appendChild(this.#divError)
        }else this.#divError.innerHTML = this.#validator.template(error.message)
    }
    #removeErrorMessage(){
        if(this.#divError){
            this.parentElement.removeChild(this.#divError);
            this.#divError = null;
        }

    }

    addValidator(validator){
        this.#validator = {
            fn: validator.fn,
            template: validator.templateError
        }
    }
}