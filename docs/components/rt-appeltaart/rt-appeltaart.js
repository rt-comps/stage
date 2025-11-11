const [ compName, basePath ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_sR;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.addEventListener("neworder", e => this.#dispatchOrder(e));
        this.addEventListener("formready", e => this.#getMenu(e));
    }
    #getMenu(e) {
        if (e instanceof Event) e.stopPropagation();
        const dataFile = this.getAttribute("datafile");
        if (dataFile) this.#_sR.querySelector("rt-orderform").loadMenu(dataFile); else {
            const frag = document.createRange().createContextualFragment('<h1 style="color: white; background-color: red; text-align: center">"datafile" attribute not provided</h1>');
            this.#_sR.appendChild(frag);
            console.error('"datafile" attribute value must exist and cannot be an empty string');
        }
    }
    #dispatchOrder(e) {
        if (e instanceof Event) {
            e.stopPropagation();
            this.#_sR.querySelector("rt-orderform").accepted();
        }
        console.log(e);
        return;
        if (e.detail) {
            const handler = "http://localhost:5100/dev/API/sendmail.php";
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tag: "item-line",
                    order: e.detail.order,
                    details: e.detail.person
                })
            };
            fetch(handler, options).then(response => {
                if (response.ok) return response.text();
            }).then(text => {
                if (text.slice(-2) === "OK" && text.slice(-3) !== "NOK") {
                    this.#_sR.querySelector("rt-orderform").accepted();
                } else {
                    alert("Order submission failed");
                    console.warn(text);
                }
            });
        }
    }
    show() {
        this.#_sR.querySelector("dialog").showModal();
    }
});