// ================================================================
// get component name from directory name
const [compName] = rtlib.parseCompURL(import.meta.url);

customElements.define(
    compName,
    class extends rtBC.RTBaseClass {
        // Declare private class fields
        #_sR;       //Shadow Root
        #_lines;    //DIV containing <item-line>s
        #_caret;    //SPAN to display caret

        //+++ Lifecycle events
        //--- Contructor
        constructor() {
            // Initialise 'this'
            super();
            // Attach shadowDOM
            this.#_sR = this.attachShadow({ mode: "open" });
            // Attach contents of template placed in document.head
            this.#_sR.append(this.$getTemplate());

            // Create handle to slotted content for toggling visibility
            this.#_lines = this.#_sR.querySelector('#lines');
            // Create handle for caret toggling
            this.#_caret = this.#_sR.querySelector('#caret');

            // Set displayed title to combination of 'value' and 'desc' (if provided)
            this.#_sR.querySelector('#text').innerHTML = `${this.$attr('value')}${this.hasAttribute('desc') ? ' ' + this.$attr('desc') : ''}`;

            //###### Event Listeners
            // Respond to user click to toggle variety items display - does not leave parent's Shadow DOM
            this.#_sR.querySelector('#title').addEventListener('click', () => this.$dispatch({ name: 'variety-toggle', detail: { value: this.$attr('value') } }));
            // Respond to any 'variety-toggle' event 
            // this.addEventListener('variety-toggle', this.#toggleItems);
        }

        //--- connectedCallback
        connectedCallback() {
            // Look for and pull in external style definition
            if (typeof rtForm !== 'undefined') rtForm.getStyle(this, rtForm.findNode(this));

            // Delay external listener attachment to ensure '#eventBus' is present
            setTimeout(() => {
                const eventBus = this.closest('#eventBus');
                if (eventBus) {
                    const initFunc = {
                        handleEvent: this.#initialiseDisplay,
                        varNode: this
                    }
                    eventBus.addEventListener('initdetails', initFunc);
                    const toggleFunc = {
                        handleEvent: this.#toggleItems,
                        varNode: this    
                    }
                    this.parentNode.addEventListener('variety-toggle', toggleFunc);
                }
                else console.error(`${this.tagName}: Element with id of "eventBus" not found`);
            }, 0);
        }

        //--- disconnectedCallback
        // Garbage collect event listeners outside the component
        disconnectedCallback() {
            const eventBus = this.closest('#eventBus');
            if (eventBus) {
                eventBus.removeEventListener('initdetails', initFunc);
            }
            this.parentNode.removeEventListener('variety-toggle', toggleFunc);
        }
        //+++ End Of Lifecycle events

        //--- #initialiseDisplay
        // Ensure 'default' variety attribute is respected every time this menu item is chosen
        #initialiseDisplay(e) {
            // Only bother initialising display if this <item-data> chosen
            if (e.detail.id === this.varNode.parentNode.id) {
                // Set 'hidden' to correct value and set correct caret
                this.varNode.#toggleItems({ detail: { value: this.varNode.hasAttribute('default') ? this.varNode.$attr('value') : '' } });
            }
        }

        //--- #toggleItems
        // Determine if this variety should be displayed
        // Is used both manually and to handle event
        #toggleItems(e) {
            let varNode=this
            // If handling event then stop bubbling and use sent value of 'this'
            if (e instanceof Event) {
                e.stopPropagation();
                varNode = this.varNode;
            }
            // Set 'hidden' based this component being chosen
            varNode.#_lines.hidden = (e.detail.value !== varNode.$attr('value'))
            // Select the correct caret character based in the value of 'hidden' 
            varNode.#_caret.innerHTML = varNode.#_lines.hidden ? '&#9656' : '&#9662';
        }
    }
);