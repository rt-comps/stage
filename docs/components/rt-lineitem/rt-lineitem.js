const [ compName, basePath ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_sR;
    #_counter;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.#_counter = this.#_sR.querySelector("rt-plusminus");
        const delFunc = {
            handleEvent: this.#deleteMe,
            lineNode: this
        };
        this.#_sR.querySelector("#delete").addEventListener("click", delFunc);
        this.addEventListener("updatecount", this.#update);
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined") rtForm.getStyle(this, rtForm.findNode(this));
        setTimeout(() => {
            this.count = this.parentNode.cartContents.get(this.$attr("prodid"));
            this.#render();
        }, 0);
    }
    #deleteMe() {
        this.lineNode.count = 0;
        this.lineNode.#update();
    }
    #render() {
        const unit = parseInt(this.$attr("unit"));
        const count = parseInt(this.count);
        this.#_sR.querySelector("#unit").innerHTML = `${this.$euro(unit / 100)}`;
        this.#_sR.querySelector("#total").innerHTML = `${this.$euro(count * unit / 100)}`;
        this.#_sR.querySelector("img").src = `${basePath}/components/${compName}/imgs/trashcan.jpeg`;
    }
    #update(e) {
        if (e instanceof Event) e.stopImmediatePropagation();
        this.$dispatch({
            name: "cartmod",
            detail: {
                prodID: this.$attr("prodid"),
                count: parseInt(this.count)
            }
        });
        if (this.count > 0) this.#render(); else this.remove();
    }
    get count() {
        return this.#_counter.$attr("count");
    }
    set count(c) {
        this.#_counter.$attr("count", c);
    }
});