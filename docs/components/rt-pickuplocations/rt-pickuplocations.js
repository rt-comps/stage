const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    static formAssociated = true;
    #_sR;
    #_internals;
    #_times;
    #_dates;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.#_internals = this.attachInternals();
        this.#_times = this.#_sR.querySelector("#fs-time");
        this.#render();
        const changeFunc = {
            handleEvent: this.#updateRadio,
            pickLoc: this
        };
        this.#_sR.querySelector("#container").addEventListener("change", changeFunc);
    }
    connectedCallBack() {
        if (typeof rtForm !== "undefined" && rtForm.findNode(this, "form")) rtForm.getStyle(this, rtForm.findNode(this));
        this.#_dates = this.#_sR.querySelector("#container rt-datepicker");
    }
    formAssociatedCallback() {
        if (this.#_internals.form) {
            this.#_internals.form.addEventListener("formdata", e => {
                const location = this.#_sR.querySelector('input[name="location"]:checked');
                e.formData.append(`pickup-location`, location ? location.value : "");
                const time = this.#_sR.querySelector('input[name="time-slot"]:checked');
                e.formData.append(`pickup-time`, time ? time.value : "");
                if (this.#_dates) e.formData.append("pickup-date", this.#_dates.value);
            });
        }
    }
    formResetCallback() {
        [ ...this.#_sR.querySelectorAll("input:checked") ].forEach(el => el.checked = false);
        this.#_times.hidden = true;
        if (this.#_dates) this.#_dates.reset();
    }
    #render() {
        const nodes = [ ...this.querySelectorAll("pu-loc") ];
        if (nodes.length > 0) {
            const _createRadioLabel = (name, value) => this.$createElement({
                tag: "label",
                append: [ this.$createElement({
                    tag: "input",
                    type: "radio",
                    name: name,
                    value: value,
                    required: true
                }), this.$createElement({
                    tag: "span",
                    innerHTML: `&nbsp;${value}`
                }) ]
            });
            this.#_sR.querySelector("fieldset#pickup").append(...nodes.map(element => _createRadioLabel("location", element.id)));
            this.#_sR.querySelector("fieldset#pu-times").append(...nodes.map(element => {
                let newEl;
                const innerNodes = [ ...element.querySelectorAll("time-slot") ];
                if (innerNodes.length) {
                    const toAppend = [ ...innerNodes.map(el => _createRadioLabel("time-slot", el.innerHTML)) ];
                    newEl = this.$createElement({
                        tag: "div",
                        id: `rad-${element.id}`,
                        hidden: true,
                        append: toAppend
                    });
                }
                return newEl;
            }));
            const puDate = this.querySelector("pu-dates");
            if (puDate) {
                const attrs = {};
                const elAttrs = puDate.attributes;
                for (let x = 0; x < elAttrs.length; x++) {
                    const elAttr = elAttrs.item(x);
                    attrs[elAttr.name] = elAttr.value;
                }
                this.#_sR.querySelector("#container").append(this.$createElement({
                    tag: "rt-datepicker",
                    attrs: attrs
                }));
                this.#_dates = this.#_sR.querySelector("#container rt-datepicker");
            }
        }
    }
    #updateRadio(e) {
        let pickupLoc = this;
        if (e instanceof Event) {
            e.stopPropagation();
            pickupLoc = this.pickLoc;
            if (e.target.getAttribute("name") === "location") {
                const allNodes = [ ...e.currentTarget.querySelectorAll("fieldset div") ];
                allNodes.forEach(element => {
                    if (element.id === `rad-${e.target.value}`) element.hidden = false; else element.hidden = true;
                });
                if (pickupLoc.#_times.hidden === true) pickupLoc.#_times.hidden = false;
            }
            if (e.target.getAttribute("name") === "time-slot") {
                if (pickupLoc.#_dates.hidden === true) pickupLoc.#_dates.hidden = false;
            }
            return;
        }
        const isChecked = pickupLoc.#_sR.querySelectorAll('#container input[name="time-slot"]:checked');
        if (isChecked) isChecked.checked = false;
    }
    checkValidity() {
        const flags = new Map([ [ "valid", true ] ]);
        [ "location", "time-slot" ].forEach(field => {
            if (flags.get("valid")) {
                if (!this.#_sR.querySelector(`input[name="${field}"]:checked`)) {
                    flags.set("valid", false);
                    flags.set("field", `pickup-location: ${field}`);
                }
            }
        });
        if (flags.get("valid") && this.#_dates) return this.#_sR.querySelector("rt-datepicker").checkValidity(); else return flags;
    }
    focus(field) {
        const fieldName = field.replace(/^pickup-location: /, "");
        switch (fieldName) {
          case "location":
            this.#_sR.querySelector("#fs-pickup").focus({
                focusVisible: true
            });
            break;

          case "time-slot":
            this.#_sR.querySelector("#fs-time").focus({
                focusVisible: true
            });
            break;

          default:
            this.#_dates.focus();
        }
    }
});