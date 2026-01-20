const [ compName, compPath ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    constructor() {
        super().attachShadow({
            mode: "open"
        }).append(this.$getTemplate());
        this.setAttribute("slot", "footer");
    }
    connectedCallback() {
        if (this.hasAttribute("types")) {
            let imgPath;
            if (rtForm) {
                const _orderRoot = rtForm.findNode(this);
                if (_orderRoot) {
                    const _imgPath = _orderRoot.querySelector("form-config #allergyimgpath");
                    if (_imgPath) imgPath = _imgPath.textContent;
                }
            }
            if (imgPath && imgPath.indexOf("/") === 0) this.imgPath = `${compPath}${this.imgPath}`;
            if (!imgPath) imgPath = `${compPath}/static/allergenimg`;
            const allergens = this.getAttribute("types").split(",").filter(el => el);
            if (allergens.length > 0) {
                this.append(...allergens.map(el => {
                    return this.$createElement({
                        tag: "al-allergen",
                        attrs: {
                            id: el,
                            imgpath: imgPath
                        }
                    });
                }));
            } else console.error("Provided allergens list is empty");
        } else console.error('Allergen "types" attribute not provided');
    }
});