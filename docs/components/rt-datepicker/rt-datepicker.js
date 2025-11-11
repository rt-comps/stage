const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    static formAssociated = true;
    #_sR;
    #_aL;
    #_aR;
    #_internals;
    #_eventBus;
    #_value;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.#_internals = this.attachInternals();
        this.#_eventBus = this.#_sR.querySelector("#container");
        this.#_aL = this.#_sR.querySelector("#al");
        this.#_aR = this.#_sR.querySelector("#ar");
        this.#_eventBus._week = 0;
        this.#_aL.addEventListener("click", () => this.#arrowRespond(-1));
        this.#_aR.addEventListener("click", () => this.#arrowRespond(1));
        const datePickFunc = {
            handleEvent: this.#choiceRespond,
            pickerNode: this
        };
        this.addEventListener("datepicked", datePickFunc);
        let invalidDays = [ 0, 6 ];
        if (this.$attr("invalid")) {
            invalidDays = this.$attr2NumArray("invalid");
        }
        const dateNodes = this.#_sR.querySelectorAll("dp-date");
        dateNodes.forEach(node => {
            if (invalidDays.includes(node.getAttribute("day") % 7)) {
                node.setAttribute("invalid", "");
            }
        });
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined" && rtForm.findNode(this, "form")) rtForm.getStyle(this, rtForm.findNode(this));
        this.#_eventBus._maxWeek = this.$attr("maxweek") ? parseInt(this.$attr("maxweek")) - 1 : undefined;
        this.#_eventBus._locale = this.$attr("locale") || undefined;
        this.hidden = true;
    }
    formAssociatedCallback(form) {
        if (form) {
            form.addEventListener("formdata", e => e.formData.set("picked-date", this.#_value));
        }
    }
    formResetCallback() {
        this.#clearChosen();
        this.hidden = true;
        this.#_eventBus._week = 0;
        this.$dispatch({
            name: "changeWeek",
            composed: false,
            eventbus: this.#_eventBus
        });
    }
    #arrowRespond(change) {
        this.#clearChosen();
        this.#_eventBus._week += change;
        if (this.#_eventBus._week < 0) this.#_eventBus._week = 0;
        if (this.#_eventBus._maxWeek && this.#_eventBus._week > this.#_eventBus._maxWeek) this.#_eventBus._week = this.#_eventBus._maxWeek;
        this.$dispatch({
            name: "changeWeek",
            composed: false,
            eventbus: this.#_eventBus
        });
    }
    #choiceRespond(e) {
        this.pickerNode.#_value = this.pickerNode.$localeDate(e.detail.date, this.pickerNode.#_eventBus._locale, {
            weekday: "short",
            month: "short",
            year: "numeric",
            day: "numeric"
        });
        this.pickerNode.#dispatchChoice(e.detail.day);
    }
    #clearChosen() {
        this.#dispatchChoice("-1");
        this.#_value = null;
    }
    #dispatchChoice(day) {
        this.$dispatch({
            name: "choiceMade",
            detail: {
                day: day
            },
            composed: false,
            eventbus: this.#_eventBus
        });
    }
    get value() {
        return this.#_value;
    }
    get name() {
        return this.$attr("name");
    }
    checkValidity() {
        return new Map([ [ "valid", this.#_value ? true : false ], [ "field", "datepicker" ] ]);
    }
    focus() {
        this.#_sR.querySelector("#container").focus({
            focusVisible: true
        });
    }
    reset() {
        this.formResetCallback();
    }
});