const [ compName ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName.slice(compName.lastIndexOf("/") + 1), class extends rtBC.RTBaseClass {
    #_sR;
    #_date = new Date();
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.#_sR.querySelector("#container").addEventListener("click", () => this.pickDate());
    }
    connectedCallback() {
        setTimeout(() => {
            if (this.parentNode) {
                this.parentNode.addEventListener("changeWeek", () => this.render());
                this.parentNode.addEventListener("choiceMade", e => this.reset(e));
                this.render();
            } else console.error(`${this.localName} - Could find parent`);
        });
    }
    static get observedAttributes() {
        return [ "invalid" ];
    }
    attributeChangedCallback() {
        this.render();
    }
    render() {
        if (this.hasAttribute("day")) {
            const today = new Date();
            const dateId = parseInt(this.$attr("day"));
            const currentWeek = this.parentNode._week || 0;
            this.#_sR.querySelector("#container").style.color = this.hasAttribute("invalid") || currentWeek === 0 && today.getDay() > dateId ? "rgb(204,204,204)" : "rgb(0,0,0)";
            this.#_date = today;
            this.#_date.setDate(today.getDate() + 7 * currentWeek + (dateId - today.getDay()));
            this.#_sR.querySelector("#day").innerHTML = this.$localeDate(this.#_date, this.parentNode._locale, {
                weekday: "short"
            });
            this.#_sR.querySelector("#date").innerHTML = `${this.#_date.getDate()} ${this.$localeDate(this.#_date, this.parentNode._locale, {
                month: "short"
            })}`;
        } else {
            this.#_sR.querySelector("#day").innerHTML = "ERROR";
            this.#_sR.querySelector("#date").innerHTML = "...";
        }
    }
    pickDate() {
        const cont = this.#_sR.querySelector("#container");
        if (cont.style.color == "rgb(0, 0, 0)") {
            cont.classList.add("chosen");
            this.$dispatch({
                name: "datepicked",
                detail: {
                    date: this.#_date,
                    day: this.$attr("day")
                }
            });
        }
    }
    reset(e) {
        if (!this.hasAttribute("invalid")) {
            if (this.$attr("day") !== e.detail.day) this.#_sR.querySelector("#container").classList.remove("chosen");
        }
    }
});