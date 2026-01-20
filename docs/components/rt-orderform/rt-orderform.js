const [ compName, basePath ] = rtlib.parseCompURL(import.meta.url);

customElements.define(compName, class extends rtBC.RTBaseClass {
    #_cart;
    #_details;
    #_form;
    #_menu;
    #_sR;
    #cartContents;
    #mobile;
    constructor() {
        super();
        this.#_sR = this.attachShadow({
            mode: "open"
        });
        this.#_sR.append(this.$getTemplate());
        const _this = this;
        this.id = "eventBus";
        this.#_form = this.#_sR.querySelector("form#user-form");
        this.#_details = this.#_sR.querySelector("#product-details");
        this.#_menu = this.#_sR.querySelector("#menu-items-container");
        this.#_cart = this.#_sR.querySelector("#cart");
        this.#cartContents = new Map(Object.entries(JSON.parse(localStorage.getItem("currentOrder")) || {}));
        this.#mobile = window.matchMedia("(max-width: 430px)").matches;
        const initDeetsFunc = {
            handleEvent: this.#detailsInitItemValues,
            orderNode: this
        };
        this.addEventListener("initdetails", initDeetsFunc);
        this.#_menu.addEventListener("updatecountitem", e => {
            e.stopPropagation();
            this.#detailsButtonDisplay();
        });
        this.#_cart.addEventListener("cartmod", e => this.#orderModifyCurrent(e));
        this.#_sR.querySelector("#product-details-close").addEventListener("click", initDeetsFunc);
        this.#_sR.querySelector("#prod-add-but").addEventListener("click", e => this.#detailsButtonClick(e));
        this.#_sR.querySelector("#further-but").addEventListener("click", () => this.#orderContinue());
        this.#_sR.querySelector("#recover-but").addEventListener("click", () => this.#orderRecover());
        this.#_sR.querySelector("#submit-but").addEventListener("click", () => this.#orderDispatch());
        this.#_sR.querySelector("#cancel-but").addEventListener("click", () => {
            this.#formShow(false);
            this.#_sR.querySelector("div#cart").style.display = "";
            this.#_form.reset();
        });
    }
    connectedCallback() {
        if (typeof rtForm !== "undefined") rtForm.getStyle(this, rtForm.findNode(this));
        setTimeout(() => {
            this.$dispatch({
                name: "formready"
            });
        }, 0);
    }
    #cartButtonsDisplay() {
        const buttons = new Map([ [ "further", this.#_sR.getElementById("further-but") ], [ "last", this.#_sR.getElementById("recover-but") ] ]);
        for (const [ key, value ] of buttons) {
            value.style.display = "none";
        }
        let newBut;
        const cartEmpty = this.querySelectorAll("rt-lineitem").length === 0;
        switch (true) {
          case cartEmpty && localStorage.getItem("lastOrder") !== null:
            newBut = "last";
            break;

          case !cartEmpty && this.#_sR.querySelector("#form-container").style.display === "none":
            newBut = "further";
            break;

          default:
            newBut = null;
        }
        if (newBut) buttons.get(newBut).style.display = "";
    }
    #cartCurOrderUpdate(item) {
        if (!(item instanceof Map && item.has("prodID") && item.has("count"))) {
            console.error('#cartCurOrderUpdate() : "item" not in expected form');
            return;
        }
        const flags = new Map([ [ "updated", false ], [ "found", false ] ]);
        const prodID = item.get("prodID");
        const count = item.get("count");
        if (this.#cartContents.size > 0) {
            if (this.#cartContents.has(prodID)) {
                flags.set("found", true);
                if (count !== this.#cartContents.get(prodID)) {
                    if (count === 0) this.#cartContents.delete(prodID); else this.#cartContents.set(prodID, count);
                    flags.set("updated", true);
                }
            }
        }
        if (!flags.get("found") && count > 0) {
            this.#cartContents.set(prodID, count);
            flags.set("updated", true);
        }
        return flags.get("updated");
    }
    #cartRebuild() {
        const currentCartContents = [ ...this.querySelectorAll("rt-lineitem") ];
        currentCartContents.forEach(node => node.remove());
        let orderTotal = 0;
        if (this.#cartContents.size) {
            const newNodes = [];
            this.#cartContents.forEach((count, prodID) => {
                const itemLine = this.querySelector(`rt-itemline[prodid="${prodID}"]`);
                const itemVar = itemLine.parentElement;
                const itemName = itemVar.parentElement;
                const itemText = `${itemName.querySelector("item-title").innerText}<br/>${itemVar.getAttribute("value")} ${itemVar.getAttribute("desc")}<br/>${itemLine.innerText}`;
                const unitPrice = itemLine.getAttribute("prijs");
                orderTotal += parseInt(unitPrice) * count;
                newNodes.push(this.$createElement({
                    tag: "rt-lineitem",
                    innerHTML: itemText,
                    attrs: {
                        slot: "cart",
                        prodid: prodID,
                        unit: unitPrice
                    }
                }));
            });
            this.append(...newNodes);
        }
        this.#_sR.querySelector("#order-total-amount").innerHTML = this.$euro(orderTotal / 100);
        this.#cartButtonsDisplay();
    }
    #cartToggle() {
        const classes = this.#_cart.classList;
        if (classes.contains("mini")) classes.remove("mini"); else classes.add("mini");
    }
    #cartTotal() {
        let cartTotal = 0;
        this.querySelectorAll("rt-lineitem").forEach(node => {
            cartTotal += parseInt(node.$attr("unit")) * parseInt(node.count);
        });
        this.#_sR.querySelector("#order-total-amount").innerHTML = this.$euro(cartTotal / 100);
    }
    #detailsButtonClick(e) {
        if (e) {
            e.stopPropagation();
            if (e.target.id !== "prod-add-but" || e.target.classList.contains("button-dis")) return;
            const flags = new Map([ [ "changed", false ] ]);
            const updatedLines = this.querySelectorAll('[slot="active-data"] rt-itemline[updated]');
            if (updatedLines.length === 0) return;
            updatedLines.forEach(node => {
                if (this.#cartCurOrderUpdate(new Map([ [ "prodID", node.$attr("prodid") ], [ "count", parseInt(node.count) ] ])) && !flags.get("changed")) flags.set("changed", true);
                node.removeAttribute("updated");
            });
            if (flags.get("changed")) {
                if (this.#cartContents.size > 0) localStorage.setItem("currentOrder", this.$map2JSON(this.#cartContents)); else localStorage.removeItem("currentOrder");
                this.#cartRebuild();
            }
        }
        this.#detailsInitItemValues();
    }
    #detailsButtonDisplay() {
        const hide = getComputedStyle(this).getPropertyValue("--OF-HIDE-UPDATE");
        const buttonClasses = this.shadowRoot.querySelector("#prod-add-but").classList;
        const lineItems = this.querySelectorAll("rt-itemdata[slot] rt-itemline[updated]");
        if (lineItems.length > 0) {
            buttonClasses.remove("button-dis");
            if (hide) buttonClasses.remove("button-hide");
        } else {
            buttonClasses.add("button-dis");
            if (hide) buttonClasses.add("button-hide");
        }
    }
    #detailsInitItemValues(e) {
        if (e instanceof Event) {
            e.stopPropagation();
            const orderNode = this.orderNode;
            if (orderNode) {
                if (e.detail.id) {
                    const newItem = e.detail.id;
                    orderNode.querySelectorAll("rt-itemdata").forEach(el => el.removeAttribute("slot"));
                    const newData = orderNode.querySelector(`rt-itemdata#${newItem}`);
                    newData.setAttribute("slot", "active-data");
                    newData.querySelectorAll("rt-itemline").forEach(item => {
                        item.count = orderNode.#cartContents.has(item.$attr("prodid")) ? orderNode.#cartContents.get(item.$attr("prodid")) : 0;
                        item.render();
                    });
                    orderNode.#detailsButtonDisplay();
                    orderNode.#_details.showModal();
                } else orderNode.#_details.close();
            }
        } else this.#_details.close();
    }
    #detailsUpdateCart() {}
    #formShow(show) {
        this.#_menu.querySelector("#menu").style.display = show ? "none" : "";
        this.#_menu.querySelector("#form-container").style.display = show ? "" : "none";
        this.#cartButtonsDisplay();
    }
    #formValidate() {
        const flags = new Map([ [ "failed", false ] ]);
        if (this.#_form) {
            const nodes = this.#_form.querySelectorAll("rt-form-field[required], rt-pickuplocations");
            for (const el of nodes) {
                const result = el.checkValidity();
                if (!result.get("valid")) {
                    const field = result.get("field");
                    el.focus(field);
                    flags.set("failed", true);
                    flags.set("field", field);
                    break;
                }
            }
        }
        return flags;
    }
    #orderContinue() {
        const details = localStorage.getItem("user-details");
        if (details) {
            this.#_form.querySelector("#savefields").checked = true;
            this.$JSON2map(details).forEach((value, key) => this.#_form.querySelector(`[name=${key}]`).value = value);
        }
        this.#formShow(true);
        if (this.#mobile) this.#cartToggle();
    }
    #orderDispatch() {
        const valid = this.#formValidate();
        if (!valid.get("failed")) {
            const formValues = new FormData(this.#_form);
            this.$dispatch({
                name: "neworder",
                detail: {
                    person: Object.fromEntries(formValues.entries()),
                    order: Object.fromEntries(this.#cartContents)
                }
            });
        } else console.warn(`Form submission not valid - ${valid.get("field")}`);
    }
    #orderInitialise() {
        const detailsForm = this.querySelector('div[slot="user-form"]');
        if (detailsForm) {
            this.#_sR.querySelector("form#user-form").append(detailsForm);
            detailsForm.removeAttribute("slot");
        } else {
            console.error("User details form is missing!!");
            this.#_sR.querySelector("#menu-items-container").append(document.createRange().createContextualFragment('<h1 style="color: red;">User details form is missing from data file!!</h1>'));
            return;
        }
        const imgPath = this.querySelector("form-config span#imgpath").textContent;
        const nodes = [ ...this.querySelectorAll("rt-itemdata") ];
        this.append(...nodes.map(element => {
            let elementAttrs = {
                id: `mi-${element.id}`,
                slot: "menu-items"
            };
            let imgNode = element.querySelector("img");
            if (imgNode) elementAttrs.bgimg = `${imgPath}/${imgNode.getAttribute("file")}`;
            return this.$createElement({
                tag: "of-menuitem",
                innerHTML: `${element.querySelector("item-title").innerHTML}`,
                attrs: elementAttrs
            });
        }));
        if (this.#mobile) {
            const _cartTitle = this.#_cart.querySelector("#cart-title");
            _cartTitle.addEventListener("click", () => this.#cartToggle());
            setTimeout(() => {
                const cartStyle = getComputedStyle(this.#_cart);
                const cartMod = parseInt(cartStyle.paddingTop) * 2 + parseInt(cartStyle.borderLeftWidth) * 2;
                const cartTitleSize = `${(parseFloat(_cartTitle.getBoundingClientRect().height) + cartMod).toFixed(0)}px`;
                this.#_cart.style.setProperty("--MINIMIZED-CART", cartTitleSize);
                this.#_cart.classList.remove("init");
            }, 200);
        }
        this.#_sR.querySelector("#product-details-close img").src = `${basePath}/components/${compName}/img/close-blk.png`;
        this.#_menu.querySelector("#menu").style.display = "";
        this.#cartRebuild();
    }
    #orderModifyCurrent(e) {
        e.stopPropagation();
        this.#cartCurOrderUpdate(new Map([ [ "prodID", e.detail.prodID ], [ "count", e.detail.count ] ]));
        if (this.#cartContents.size > 0) localStorage.setItem("currentOrder", this.$map2JSON(this.#cartContents)); else localStorage.removeItem("currentOrder");
        this.#cartTotal();
    }
    #orderRecover() {
        if (localStorage.getItem("lastOrder")) localStorage.setItem("currentOrder", localStorage.getItem("lastOrder"));
        this.#cartContents = this.$JSON2map(localStorage.getItem("currentOrder"));
        this.#cartRebuild();
    }
    get cartContents() {
        return this.#cartContents;
    }
    accepted() {
        localStorage.setItem("lastOrder", localStorage.getItem("currentOrder"));
        localStorage.removeItem("currentOrder");
        this.#cartContents.clear();
        this.#cartRebuild();
        const saveFields = this.#_sR.querySelector("#savefields");
        if (saveFields && saveFields.checked) {
            const fields = [ ...this.#_sR.querySelectorAll(`#formfields :is(rt-form-field, textarea)`) ];
            const output = fields.reduce((acc, el) => acc.set(el.name, el.value), new Map());
            localStorage.setItem("user-details", this.$map2JSON(output));
        } else localStorage.removeItem("user-details");
        this.#_form.reset();
        this.#formShow(false);
        console.log("Form Submitted!");
    }
    async loadMenu(url) {
        try {
            if (typeof url === "undefined") throw new Error("No Datafile", {
                cause: "nofile"
            });
            const response = await fetch(url);
            if (!response.ok) throw new Error("Datafile URL is not valid", {
                cause: "invalid"
            });
            const htmlText = await response.text();
            const frag = document.createRange().createContextualFragment(htmlText);
            this.appendChild(frag);
            const dependancies = [ ...new Set(Array.from(this.querySelectorAll("*")).map(el => {
                const tagName = el.tagName.toLowerCase();
                if (tagName.indexOf("rt-") === 0) return tagName;
            }).filter(el => el).concat([ "rt-lineitem" ])) ];
            await Promise.all(dependancies.map(async depComp => {
                try {
                    await import(`${basePath}/components/${depComp}/index.js`);
                } catch (e) {
                    throw `Component "${compName}" could not load dependency "${depComp}" so stopping!!`;
                }
            }));
            this.#orderInitialise();
        } catch (e) {
            console.error(e);
            let output;
            switch (e.cause) {
              case "nofile":
                output = '<h1 style="color: red;">Datafile URL not provided</h1>';
                break;

              case "invalid":
                output = '<h1 style="color: red;">Datafile URL is not valid</h1>';
                break;

              default:
                output = "";
            }
            const frag = document.createRange().createContextualFragment(output);
            this.#_sR.querySelector("#menu-items-container").appendChild(frag);
        }
        this.style.display = "inline-block";
    }
});