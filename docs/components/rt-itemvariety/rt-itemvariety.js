const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_sR;
    #_lines;
    #_caret;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.#_lines = this.#_sR.querySelector("#lines");
        this.#_caret = this.#_sR.querySelector("#caret");
        this.#_sR.querySelector("#text").innerHTML = `${this.$attr("value")}${this.hasAttribute("desc") ? " " + this.$attr("desc") : ""}`;
        this.#_sR.querySelector("#title").addEventListener("click", () => this.$dispatch({
            name: "variety-toggle",
            detail: {
                value: this.$attr("value")
            }
        }));
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined") rtForm.getStyle(this, rtForm.findNode(this));
        setTimeout(() => {
            const eventBus = this.closest("#eventBus");
            if (eventBus) {
                const initFunc = {
                    handleEvent: this.#initialiseDisplay,
                    varNode: this
                };
                eventBus.addEventListener("initdetails", initFunc);
                const toggleFunc = {
                    handleEvent: this.#toggleItems,
                    varNode: this
                };
                this.parentNode.addEventListener("variety-toggle", toggleFunc);
            } else console.error(`${this.tagName}: Element with id of "eventBus" not found`);
        }, 0);
    }
    disconnectedCallback() {
        const eventBus = this.closest("#eventBus");
        if (eventBus) {
            eventBus.removeEventListener("initdetails", initFunc);
        }
        this.parentNode.removeEventListener("variety-toggle", toggleFunc);
    }
    #initialiseDisplay(e) {
        if (e.detail.id === this.varNode.parentNode.id) {
            this.varNode.#toggleItems({
                detail: {
                    value: this.varNode.hasAttribute("default") ? this.varNode.$attr("value") : ""
                }
            });
        }
    }
    #toggleItems(e) {
        let varNode = this;
        if (e instanceof Event) {
            e.stopPropagation();
            varNode = this.varNode;
        }
        varNode.#_lines.hidden = e.detail.value !== varNode.$attr("value");
        varNode.#_caret.innerHTML = varNode.#_lines.hidden ? "&#9656" : "&#9662";
    }
});