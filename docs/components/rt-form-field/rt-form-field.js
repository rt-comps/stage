// ================================================================
// === form-field class definition

// Recover component name from URL
const [compName] = rtlib.parseCompURL(import.meta.url);

// Define custom element
customElements.define(compName,
    class extends rtBC.RTBaseClass {
        // Allow this element to participate in forms
        static formAssociated = true;

        // Declare private class fields
        #_internals;
        #_input;

        //+++ Lifecycle Events
        //--- constructor
        constructor() {
            // Define 'this'
            super();
            // Create and build Shadow DOM
            const _sR = this.attachShadow({ mode: "open", delegateFocus: true });
            _sR.append(this.$getTemplate());

            // Allow form participation 
            this.#_internals = this.attachInternals();

            // Useful Nodes
            this.#_input = _sR.querySelector('input');
            // Handle 'required' fields
            if (this.$attr('required') !== null) {
                this.#_input.setAttribute('required', '');
                _sR.querySelector('span').innerHTML = '&nbsp*';
            }

            // Set input contraints if one of these type specified
            const inputType = this.$attr('type');
            switch (inputType) {
                case 'tel':
                    // constrain phone number to exactly 10 digits starting with zero(0)
                    this.#_input.pattern = "0[0-9]{9}";
                case 'email':
                    this.#_input.type = inputType;
                    break;
                case 'post':
                    // constrain postcode to 4 digits and 2 alpha - with or without a space
                    this.#_input.pattern = "[0-9]{4} {0,1}[A-Za-z]{2}";
                    break;
            }

            // Use 'label' attribute for field label
            _sR.querySelector('label').insertAdjacentHTML('afterbegin', `${this.$attr('label') || 'Name Missing'}&nbsp;`);
            // Needed for Safari
            this.addEventListener('focus', () => this.focus());
        }

        //--- connectedCallback
        connectedCallback() {
            // Look for and pull in external style definition
            if (typeof rtForm !== 'undefined' && rtForm.findNode(this, 'form')) rtForm.getStyle(this, rtForm.findNode(this));
        }

        //--- formAssociatedCallback
        // triggered when component is associated with (or dissociated from) a form
        formAssociatedCallback() {
            // If this is an association then add listener for formData event
            if (this.#_internals.form) {
                // Set form values when the FormData() contructor is invoked (via submit or new)
                this.#_internals.form.addEventListener('formdata', (e) => e.formData.set(this.name, this.value));
            }
        }

        //--- formResetCallback
        // respond to the enclosing form being reset
        formResetCallback() {
            this.#_input.value = null;
        }
        //+++ End of Lifecycle Events

        //### Expose some standard form element properties and methods
        get value() { return this.#_input.value; }
        set value(v) { this.#_input.value = v; }

        get name() { return this.$attr('name'); }
        //get form() { return this.#_internals.form; }
        //get validity() { return this.#_internals.validity; }

        // Check validity of value provided
        checkValidity() {
            return new Map([
                ['valid', this.#_input.checkValidity()],
                ['field', this.name]
            ])
        }
        //reportValidity() { return this.#_internals.reportValidity(); }
        // When focus is pushed to component then push focus to input field
        focus() { this.#_input.focus() };
    }
);