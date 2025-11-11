class RTBaseClass extends HTMLElement {
    $attr(name, newValue) {
        if (newValue === undefined) return this.getAttribute(name);
        return this.setAttribute(name, newValue);
    }
    $attr2NumArray(attr, delimiter = ",") {
        if (this.$attr !== null) {
            return this.$attr(attr).split(delimiter).map(x => Number(x));
        } else console.error("$attr2NumArray(): ", attr, "does not exist");
    }
    $createElement({
        tag = "div",
        innerHTML = ``,
        cssText = ``,
        classes = [],
        styles = {},
        attrs = {},
        append = [],
        prepend = [],
        ...props
    } = {}) {
        let newEl = typeof tag == "string" ? document.createElement(tag) : tag;
        cssText && (newEl.style.cssText = cssText);
        Object.keys(attrs).map(key => newEl.setAttribute(key, attrs[key]));
        Object.keys(styles).map(key => newEl.style[key] = styles[key]);
        classes.length > 0 && newEl.classList.add(...classes);
        innerHTML && (newEl.innerHTML = innerHTML);
        newEl.prepend(...prepend.flat());
        newEl.append(...append.flat());
        return Object.assign(newEl, props);
    }
    $dispatch({
        name = "name_not_provided",
        detail = {},
        bubbles = true,
        composed = true,
        cancelable = true,
        options = {
            bubbles: bubbles,
            composed: composed,
            cancelable: cancelable,
            detail: detail
        },
        eventbus = this
    }) {
        eventbus.dispatchEvent(new CustomEvent(name, options));
    }
    $euro(value, locale = "nl-NL") {
        return Intl.NumberFormat(locale, {
            style: "currency",
            currency: "eur"
        }).format(value);
    }
    $getTemplate(template_id = this.nodeName) {
        let template = document.getElementById(template_id);
        if (template) return template.content.cloneNode(true); else {
            console.warn("Template not found:", template_id);
            return document.createElement("span");
        }
    }
    $localeDate(date, locale = "nl-NL", options = {}) {
        return Intl.DateTimeFormat(locale, options).format(date);
    }
    $map2JSON(map) {
        return JSON.stringify(Object.fromEntries(map));
    }
    $JSON2map(string) {
        return new Map(Object.entries(JSON.parse(string)));
    }
}

export {
    RTBaseClass
};