const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_sR;
    #_maxCount;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        const colors = this.attributes["colors"];
        if (colors) {
            const [ custBgCol, custCol ] = colors.value.split(",");
            const _div = this.#_sR.querySelector("div");
            _div.style.color = custCol || "";
            _div.style.backgroundColor = custBgCol || "";
        }
        new MutationObserver(this.#countChange).observe(this, {
            attributes: true,
            attributeFilter: [ "count" ]
        });
        if (!this.$attr("count")) this.$attr("count", "0");
        this.#_sR.querySelector("#plus").addEventListener("click", () => this.#buttonPressed(1));
        this.#_sR.querySelector("#minus").addEventListener("click", () => this.#buttonPressed(-1));
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined") rtForm.getStyle(this, rtForm.findNode(this));
        setTimeout(() => {
            this.#_maxCount = parseInt(getComputedStyle(this.#_sR.querySelector("#container")).getPropertyValue("--MAX-COUNT"));
            const pos = getComputedStyle(this).getPropertyValue("--OF-PM-POS");
            if (pos.toLowerCase() === "left") this.#_sR.querySelector("div").insertAdjacentElement("afterbegin", this.#_sR.querySelector("#count"));
            if (pos.toLowerCase() === "right") this.#_sR.querySelector("div").insertAdjacentElement("beforeend", this.#_sR.querySelector("#count"));
        });
    }
    #buttonPressed(value) {
        const oldCount = parseInt(this.$attr("count"));
        let newCount = oldCount + value;
        switch (true) {
          case newCount > this.#_maxCount:
            newCount = this.#_maxCount;
            break;

          case newCount < 0:
            newCount = 0;
        }
        if (newCount !== oldCount) {
            this.$attr("count", String(newCount));
            this.$dispatch({
                name: "updatecount"
            });
        }
    }
    #countChange(record) {
        const node = record[0].target;
        node.#_sR.querySelector("#count").textContent = node.$attr(record[0].attributeName);
    }
});