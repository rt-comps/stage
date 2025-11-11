const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    constructor() {
        super().attachShadow({
            mode: "open"
        }).append(this.$getTemplate());
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined") rtForm.getStyle(this, rtForm.findNode(this));
        setTimeout(() => {
            this.querySelector("item-title").setAttribute("slot", "title");
            this.querySelector("item-desc").setAttribute("slot", "desc");
        }, 0);
    }
});