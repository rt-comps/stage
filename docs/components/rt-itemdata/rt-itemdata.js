const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_sR;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined") rtForm.getStyle(this, rtForm.findNode(this));
        setTimeout(() => {
            const title = this.querySelector("item-title");
            if (title) title.setAttribute("slot", "title");
            const desc = this.querySelector("item-desc");
            if (desc) desc.setAttribute("slot", "desc");
        }, 0);
    }
});