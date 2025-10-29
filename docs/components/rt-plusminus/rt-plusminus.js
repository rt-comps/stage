// ================================================================
// === plus-minus

// get component name from directory name
const [compName] = rtlib.parseCompURL(import.meta.url);

// Define the element usin the template in the associated .html file
customElements.define(
    compName,
    class extends rtBC.RTBaseClass {
        /// ### PRIVATE CLASS FIELDS
        #_sR;       // shadowRoot node
        #_maxCount  // Max value for 'count'

        //+++ Lifecycle Events
        //--- Contructor
        constructor() {
            // Initialise 'this'
            super();
            // Attach shadowDOM and store reference in private field
            this.#_sR = this.attachShadow({ mode: "open" });
            // Attach contents of template - placed in document.head by LoadComponent()
            this.#_sR.append(this.$getTemplate());

            // Check for custom colours.  1st colour is used for background and 2nd (if specified) for foreground
            const colors = this.attributes['colors'];
            if (colors) {
                // Get custom colour(s)
                const [custBgCol, custCol] = colors.value.split(',');
                // Get handle to container (only DIV in SR)
                const _div = this.#_sR.querySelector('div');
                // Apply custom colours to DIV
                _div.style.color = custCol || '';
                _div.style.backgroundColor = custBgCol || '';
            }

            // Look out for changes to 'count' attribute
            new MutationObserver(this.#countChange).observe(this, { attributes: true, attributeFilter: ['count'] });

            // Initialise 'count' attribute
            if (!this.$attr('count')) this.$attr('count', '0');

            // Add onClick events to plus and minus
            this.#_sR.querySelector('#plus').addEventListener('click', () => this.#buttonPressed(1));
            this.#_sR.querySelector('#minus').addEventListener('click', () => this.#buttonPressed(-1));
        }
        
        connectedCallback() {
            // Look for and pull in external style definition
            if (typeof rtForm !== 'undefined') rtForm.getStyle(this, rtForm.findNode(this));

            // Work with CSS variables - need to wait for full document to render
            setTimeout(() => {
                // Get value for MAX-COUNT
                this.#_maxCount = parseInt(getComputedStyle(this.#_sR.querySelector('#container')).getPropertyValue('--MAX-COUNT'));
                // Change quantity number position if specified
                const pos = getComputedStyle(this).getPropertyValue('--OF-PM-POS');
                if (pos.toLowerCase() === 'left')
                    this.#_sR.querySelector('div').insertAdjacentElement('afterbegin', this.#_sR.querySelector('#count'));
                if (pos.toLowerCase() === 'right')
                    this.#_sR.querySelector('div').insertAdjacentElement('beforeend', this.#_sR.querySelector('#count'));
            });
        }
        //+++ End Of Lifecycle Events

        //--- #buttonPressed
        // Update 'count' attribute based on button pressed and create an event to bubble up to parent
        #buttonPressed(value) {
            // Retrieve previous count
            const oldCount = parseInt(this.$attr('count'));
            // Update count
            let newCount = oldCount + value;
            // Apply boundary conditions to count
            switch (true) {
                case newCount > this.#_maxCount:
                    newCount = this.#_maxCount;
                    break;
                case newCount < 0:
                    newCount = 0;
            }

            // Will be true unless boundary hit
            if (newCount !== oldCount) {
                // Update count attribute (via MutationObserver)
                this.$attr('count', String(newCount));
                // Let parent know count has changed
                this.$dispatch({ name: 'updatecount' });

            }
        }

        // Update displayed text when 'count' attribute changes
        #countChange(record) {
            // 'this' is the MutationRecords Array so need to get the target node
            const node = record[0].target
            node.#_sR.querySelector('#count').textContent = node.$attr(record[0].attributeName);
        }
    }
);