
const noopValidator = {
    fn: (_) => null,
    template: (_) => null
}

export class FormControl extends HTMLInputElement {
    #currentError = null;
    #validator = noopValidator;
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
        const needCreateElement = this.#currentError && !this.#divError;
        this.#showErrorMessage(needCreateElement, error.message);
    }

    #showErrorMessage(needCreateElement, message){
        if(needCreateElement){
            this.#divError = document.createElement("div");
            this.parentElement.appendChild(this.#divError);
        }
        this.#divError.innerHTML = this.#validator.templateError(message)
    }
    #removeErrorMessage(){
        if(this.#divError){
            this.parentElement.removeChild(this.#divError);
            this.#divError = null;
        }

    }
    isValid(){
        return !this.#currentError;
    }

    addValidator(validator){
        this.#validator = validator;
    }
}