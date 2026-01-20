import {
    findNode
} from "../../../modules/rt_form.mjs";

const [ compName, compPath ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName.slice(compName.lastIndexOf("/") + 1), class extends rtBC.RTBaseClass {
    constructor() {
        super().attachShadow({
            mode: "open"
        }).append(this.$getTemplate());
    }
    connectedCallback() {
        const imgPath = this.getAttribute("imgpath");
        const _imgNode = new Image();
        _imgNode.onerror = () => {
            _imgNode.src = `${compPath}/components/${compName}/img/unknown.svg`;
            _imgNode.title = `Image "${this.id}.svg" not Found`;
        };
        _imgNode.src = `${imgPath}/${this.id}.svg`;
        _imgNode.title = this.id.replace(/^./, char => char.toUpperCase());
        this.append(_imgNode);
    }
});