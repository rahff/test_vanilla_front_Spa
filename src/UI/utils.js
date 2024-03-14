export const ngIf = (expression, template) => {
    if(expression) return template;
    return "";
}

export const ngIfElse = (expression, ifTemplate, elseTemplate) => {
    if(expression) return ifTemplate;
    return elseTemplate;
}

export const ngFor = (iterable, fnTemplate) => {
    return iterable.map(item => fnTemplate(item)).join("");
}