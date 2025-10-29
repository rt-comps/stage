// ================================================================
// get component name from directory name
const [compName] = rtlib.parseCompURL(import.meta.url);

customElements.define(
    compName,
    class extends rtBC.RTBaseClass {
        //+++ Lifecycle Events
        //--- Contructor
        constructor() {
            // Create shadowDOM
            super().attachShadow({ mode: "open" }).append(this.$getTemplate());
        }

        //--- connectedCallback
        connectedCallback() {
            // Look for and pull in external style definition
            if (typeof rtForm !== 'undefined') rtForm.getStyle(this, rtForm.findNode(this));
            // Slot basic data
            setTimeout(() => {
                this.querySelector('item-title').setAttribute('slot', 'title');
                this.querySelector('item-desc').setAttribute('slot', 'desc');
            }, 0)
        }
        //+++ End Of Lifecycle Events
    }
);
