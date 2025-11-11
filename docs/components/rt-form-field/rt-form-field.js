const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    static formAssociated = true;
    #_internals;
    #_input;
    constructor() {
        super();
        const _sR = this.attachShadow({
            mode: "open",
            delegateFocus: true
        });
        _sR.append(this.$getTemplate());
        this.#_internals = this.attachInternals();
        this.#_input = _sR.querySelector("input");
        if (this.$attr("required") !== null) {
            this.#_input.setAttribute("required", "");
            _sR.querySelector("span").innerHTML = "&nbsp*";
        }
        const inputType = this.$attr("type");
        switch (inputType) {
          case "tel":
            this.#_input.pattern = "0[0-9]{9}";

          case "email":
            this.#_input.type = inputType;
            break;

          case "post":
            this.#_input.pattern = "[0-9]{4} {0,1}[A-Za-z]{2}";
            break;
        }
        _sR.querySelector("label").insertAdjacentHTML("afterbegin", `${this.$attr("label") || "Name Missing"}&nbsp;`);
        this.addEventListener("focus", () => this.focus());
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined" && rtForm.findNode(this, "form")) rtForm.getStyle(this, rtForm.findNode(this));
    }
    formAssociatedCallback() {
        if (this.#_internals.form) {
            this.#_internals.form.addEventListener("formdata", e => e.formData.set(this.name, this.value));
        }
    }
    formResetCallback() {
        this.#_input.value = null;
    }
    get value() {
        return this.#_input.value;
    }
    set value(v) {
        this.#_input.value = v;
    }
    get name() {
        return this.$attr("name");
    }
    checkValidity() {
        return new Map([ [ "valid", this.#_input.checkValidity() ], [ "field", this.name ] ]);
    }
    focus() {
        this.#_input.focus();
    }
});