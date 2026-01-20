const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName.slice(compName.lastIndexOf("/") + 1), class extends rtBC.RTBaseClass {
    constructor() {
        super().attachShadow({
            mode: "open"
        }).append(this.$getTemplate());
        this.shadowRoot.addEventListener("initdetails", () => console.log("At the SR"));
        this.addEventListener("initdetails", e => {});
        this.addEventListener("click", () => {
            this.$dispatch({
                name: "initdetails",
                detail: {
                    id: this.id.slice(3)
                }
            });
        });
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined") rtForm.getStyle(this, rtForm.findNode(this));
        if (this.hasAttribute("bgimg")) this.shadowRoot.querySelector("#menu-item-img").style.backgroundImage = `url("${this.$attr("bgimg")}")`;
    }
});