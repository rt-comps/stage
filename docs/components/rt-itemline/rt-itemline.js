const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_sR;
    #_orderNode;
    #_counter;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.#_counter = this.#_sR.querySelector("rt-plusminus");
        this.addEventListener("updatecount", this.#updateCount);
    }
    connectedCallback() {
        this.#_orderNode = rtForm.findNode(this);
        rtForm.getStyle(this, this.#_orderNode);
        this.#_sR.querySelector("#prijs").innerHTML = `${this.$euro(parseInt(this.$attr("prijs")) / 100)}`;
    }
    #updateCount(e) {
        if (e instanceof Event) {
            e.stopImmediatePropagation();
            const newCount = parseInt(this.count);
            const inCart = this.#_orderNode.cartContents.has(this.$attr("prodid"));
            const itemMatch = inCart && this.#_orderNode.cartContents.get(this.$attr("prodid")) === newCount;
            switch (true) {
              case newCount > 0 && !inCart:
              case inCart && !itemMatch:
              case newCount === 0 && inCart:
                this.$attr("updated", "");
                break;

              default:
                this.removeAttribute("updated");
            }
            this.render();
            this.$dispatch({
                name: "updatecountitem"
            });
        }
    }
    render() {
        if (parseInt(this.count) > 0) {
            this.#_sR.querySelector("#container").style.fontWeight = "bold";
        } else {
            this.#_sR.querySelector("#container").style.fontWeight = "";
        }
    }
    get count() {
        return this.#_counter.$attr("count");
    }
    set count(c) {
        this.#_counter.$attr("count", c);
    }
});