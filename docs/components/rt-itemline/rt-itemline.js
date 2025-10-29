// ================================================================
// === item-line

// get component name from directory name
const [compName] = rtlib.parseCompURL(import.meta.url);

// Define the element usin the template in the associated .html file
customElements.define(compName,
    class extends rtBC.RTBaseClass {
        /// ### PRIVATE CLASS FIELDS
        #_sR;       // ShadowRoot node
        #_orderNode  // Top level node
        #_counter   // rt-plusminus component

        //+++ Lifecycle Events
        //--- Contructor
        constructor() {
            // Initialise 'this'
            super();
            // Attach shadowDOM and store reference in private field
            this.#_sR = this.attachShadow({ mode: "open" });
            // Attach contents of template - placed in document.head by LoadComponent()
            this.#_sR.append(this.$getTemplate());

            this.#_counter = this.#_sR.querySelector('rt-plusminus');

            //### Event Listeners
            // Respond to change in count
            this.addEventListener('updatecount', this.#updateCount);
        }

        //--- connectedCallback
        connectedCallback() {
            // Look for and pull in external style definition
            this.#_orderNode = rtForm.findNode(this);
            rtForm.getStyle(this, this.#_orderNode);
            // Display price in Euro
            this.#_sR.querySelector('#prijs').innerHTML = `${this.$euro((parseInt(this.$attr('prijs')) / 100))}`;
        }
        //+++ End of Lifecycle Events

        //--- updateCount
        // Respond to plus or minus event update count as required
        #updateCount(e) {
            if (e instanceof Event) {
                e.stopImmediatePropagation();

                // Get new value of count from plus-minus component
                const newCount = parseInt(this.count);

                /// Check if newCount matches value in the cart
                // Is prodid already in cart?
                const inCart = this.#_orderNode.cartContents.has(this.$attr('prodid'));
                // Is prodid in cart with matching count
                const itemMatch = inCart && (this.#_orderNode.cartContents.get(this.$attr('prodid')) === newCount);
                // Determine if an entry has been updated
                switch (true) {
                    case (newCount > 0 && !inCart):
                    case (inCart && !itemMatch):
                    case (newCount === 0 && inCart):
                        this.$attr('updated', '');
                        break;
                    default:
                        this.removeAttribute('updated');
                }
                this.render()
                // Tell order-form to redetermine whether 'Update' button in dialog should be visible
                this.$dispatch({ name: 'updatecountitem' })
            }
        }

        //--- render
        // Set highlighting if necessary
        render() {
            // Highlight line if count > 0
            if (parseInt(this.count) > 0) {
                this.#_sR.querySelector('#container').style.fontWeight = 'bold';
            } else {
                this.#_sR.querySelector('#container').style.fontWeight = '';
            }

        }

        //+++ Getters/Setters
        // Access value of count maintained by plus-minus component
        get count() { return this.#_counter.$attr('count') }
        set count(c) { this.#_counter.$attr('count', c) }

    }
);