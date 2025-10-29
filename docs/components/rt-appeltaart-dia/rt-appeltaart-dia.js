// ================================================================
// === ati-form
//
// This is a container for an order form
// It provides functions for loading the menu HTML and responds to a new order being placed
// 
// Note 1:  Template file exist (even though it is unnecessary) for rt.loadComponent() to 
//          function correctly
//
const [compName, compPath] = rtlib.parseCompURL(import.meta.url);

customElements.define(
    compName,
    class extends rtBC.RTBaseClass {
        // Declare private class fields
        #_sR;

        //+++ Lifecycle Events
        //--- Contructor
        constructor() {
            // Attach contents of template previously placed in document.head
            super()
            this.#_sR = this.attachShadow({ mode: "open" });
            this.#_sR.append(this.$getTemplate())

            // Get the menu file
            this.getMenu();

            this.#_sR.querySelector('#x img').src = `${compPath}/img/close-wht.png`

            // Catch form output event and display final order details
            this.addEventListener('neworder', (e) => this.dispatchOrder(e));
            this.#_sR.querySelector('#x').addEventListener('click', ()=> this.#_sR.querySelector('dialog').close());
        }

        //--- connectedCallback
        connectedCallback() {
        }
        //+++ End OF Lifecycle Events

        //--- getMenu
        // Retrieve the menu from file specified in the datafile attribute.
        // The file (currently) needs to hosted in the <ati-form> element directory
        async getMenu() {
            let appendRoot = this.#_sR.querySelector('dialog');
            // Check that the datafile attribute has been provided
            const gotData = this.$attr('datafile');
            if (gotData !== null && gotData !== '') {
                // Determing the path to the menu data file
                const url = `${compPath}/${gotData}`;
                try {
                    // Wait for fetch 
                    const response = await fetch(url)
                    // Once response has been received, check for error
                    if (!response.ok) throw `Failed to load ${url} with status ${response.status}`;
                    //Wait for the text to be available
                    const htmlText= await response.text()
                    // Create a fragment and then append to shadow DOM
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

        //--- dispatchOrder
        // Catch the neworder event from <rt-orderform> and process it as required
        dispatchOrder(e) {
            // Catch order and prevent further bubbling
            if (e instanceof Event) e.stopPropagation();
            // Process order
            if (e.detail) {
                // Define API request parameters
                // ForProd: { "handler": "https://roads-technology.com/rtform/sendmail.php" }
                const handler = 'http://localhost:5100/dev/API/sendmail.php';
                const options = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        //uri: document.documentURI,
                        tag: 'item-line',
                        order: e.detail.order,
                        details: e.detail.person
                    })
                };

                // Make API request
                fetch(handler, options)
                    .then((response) => { if (response.ok) return response.text(); })
                    .then((text) => {
                        //document.querySelector('#Debug').innerHTML = text;
                        if (text.slice(-2) === 'OK' && text.slice(-3) !== 'NOK') {
                            this.#_sR.querySelector('rt-orderform').accepted();
                        } else {
                            alert('Order submission failed');
                            console.warn(text);
                        }
                    });
            }

        }

        show(){
            this.#_sR.querySelector('dialog').showModal();
        }

    }
);