const [ compName, compPath ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_sR;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        this.getMenu();
        this.#_sR.querySelector("#x img").src = `${compPath}/img/close-wht.png`;
        this.addEventListener("neworder", e => this.dispatchOrder(e));
        this.#_sR.querySelector("#x").addEventListener("click", () => this.#_sR.querySelector("dialog").close());
    }
    connectedCallback() {}
    async getMenu() {
        let appendRoot = this.#_sR.querySelector("dialog");
        const gotData = this.$attr("datafile");
        if (gotData !== null && gotData !== "") {
            const url = `${compPath}/${gotData}`;
            try {
                const response = await fetch(url);
                if (!response.ok) throw `Failed to load ${url} with status ${response.status}`;
                const htmlText = await response.text();
                const frag = document.createRange().createContextualFragment(htmlText);
                appendRoot.appendChild(frag);
            } catch (e) {
                console.warn(e);
            }
        } else {
            const frag = document.createRange().createContextualFragment('<h1 style="color: red;">datafile attribute not provided</h1>');
            appendRoot.appendChild(frag);
        }
    }
    dispatchOrder(e) {
        if (e instanceof Event) e.stopPropagation();
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