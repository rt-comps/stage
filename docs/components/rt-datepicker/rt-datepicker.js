// ================================================================
// === date-picker class definition

// Recover component name from URL
const [compName] = rtlib.parseCompURL(import.meta.url);

// Define custom element
customElements.define(compName,
    class extends rtBC.RTBaseClass {
        // Allow this component to participate in forms
        static formAssociated = true;
        // Private class fields
        #_sR;           // ShadowRoot
        #_aL;
        #_aR;
        #_internals;    // Internals (Form)
        #_eventBus;     // Where events are dispatched/listened
        #_value;        // Value used by Form

        //+++ Lifecycle Events
        //--- constructor
        constructor() {
            // Need to run before can access 'this'
            super();
            // Make shadowRoot accessible via private class field
            this.#_sR = this.attachShadow({ mode: "open" })
            this.#_sR.append(this.$getTemplate());
            
            // Allow form participation
            this.#_internals = this.attachInternals();
            
            // Initialise other private class fields
            this.#_eventBus = this.#_sR.querySelector('#container');
            this.#_aL = this.#_sR.querySelector('#al');
            this.#_aR = this.#_sR.querySelector('#ar');
            // Initialise property that can be accessed by children via the parentNode property
            this.#_eventBus._week = 0;
            
            
            //### Event Listners
            this.#_aL.addEventListener('click', () => this.#arrowRespond(-1));
            this.#_aR.addEventListener('click', () => this.#arrowRespond(1));
            // Create event object 
            const datePickFunc = {
                handleEvent: this.#choiceRespond,
                pickerNode: this
            }
            this.addEventListener('datepicked', datePickFunc);
            
            // Mark days to always disable
            let invalidDays = [0, 6]; // Default - Sat & Sun
            // Overwrite default if attribute specified
            if (this.$attr('invalid')) {
                // Convert 'invalid' parameter value to array of integers
                invalidDays = this.$attr2NumArray('invalid');
            }
            // Get all <dp-date> nodes
            const dateNodes = this.#_sR.querySelectorAll('dp-date');
            // Set all invalid days. MOD allows for display of more than 1 week in picker
            dateNodes.forEach(node => { if (invalidDays.includes((node.getAttribute('day')) % 7)) { node.setAttribute('invalid', ''); } });
            
        }
        
        connectedCallback() {
            // Once appended in to form, look for and pull in external style definition
            if (typeof rtForm !== 'undefined' && rtForm.findNode(this, 'form')) rtForm.getStyle(this, rtForm.findNode(this));
            // Initialise private fields from properties
            this.#_eventBus._maxWeek = this.$attr('maxweek') ? parseInt(this.$attr('maxweek')) - 1 : undefined;
            this.#_eventBus._locale = this.$attr('locale') || undefined;
            // Picker hidden by default
            this.hidden = true;
        }

        //--- formAssociatedCallback
        // triggered when component is associated with (or dissociated from) a form
        formAssociatedCallback(form) {
            // If this is an association then add listener for formData request
            if (form) {
                // Set form values when the FormData() contructor is invoked (via submit or new)
                form.addEventListener('formdata', (e) => e.formData.set('picked-date', this.#_value));
            }
        }

        //--- formResetCallback
        // respond to the enclosing form being reset
        formResetCallback() {
            this.#clearChosen();
            this.hidden = true;
            // Reset week and inform all <dp-date> components of the change
            this.#_eventBus._week = 0;
            this.$dispatch({
                name: 'changeWeek',
                composed: false,
                eventbus: this.#_eventBus
            });

        }
        //+++ End of Lifecycle Events

        //--- arrowRespond
        // Clear highlighting and change week
        #arrowRespond(change) {
            // Reset any chosen value
            this.#clearChosen();
            // Apply change to _week
            this.#_eventBus._week += change;
            // Limit lowest value to zero
            if (this.#_eventBus._week < 0) this.#_eventBus._week = 0;
            // Adhere to upper limit - if set
            if (this.#_eventBus._maxWeek && (this.#_eventBus._week > this.#_eventBus._maxWeek)) this.#_eventBus._week = this.#_eventBus._maxWeek;

            // Let child <dp-date> components know that _week has changed
            this.$dispatch({
                name: 'changeWeek',
                composed: false,
                eventbus: this.#_eventBus
            });
        }

        //--- #choiceRespond
        // Respond to a date being chosen
        #choiceRespond(e) {
            // Store chosen value
            this.pickerNode.#_value = this.pickerNode.$localeDate(e.detail.date, this.pickerNode.#_eventBus._locale, { weekday: 'short', month: 'short', year: 'numeric', day: 'numeric' });
            // Inform all <dp-date> about choice
            this.pickerNode.#dispatchChoice(e.detail.day);
        }

        //--- #clearChosen
        // Tell all <dp-date> components to clear any highlight and clear form value
        #clearChosen() {
            // '-1' should not match a <dp-date> component
            this.#dispatchChoice('-1');
            // Clear the form value
            this.#_value = null;
        }    

        //--- #dispatchChoice
        // Tell all <dp-date> components to highlight if chosen
        #dispatchChoice(day) {
            this.$dispatch({
                name: 'choiceMade',
                detail: { day },
                composed: false,
                eventbus: this.#_eventBus
            })    
        }    

        //+++ Expose some standard form element properties and methods
        get value() { return this.#_value; }
        //set value(v) { this.#_input.value = v; }

        get name() { return this.$attr('name'); }
        //get form() { return this.#_internals.form; }
        //get validity() { return this.#_internals.validity; }

        // Check validity - valid if value provided
        checkValidity() {
            return new Map([
                ['valid', this.#_value ? true : false],
                ['field', 'datepicker']
            ])
        }

        //reportValidity() { return this.#_internals.reportValidity(); }
        focus() { this.#_sR.querySelector('#container').focus({ focusVisible: true }) };

        // Allow the component to be manually reset (needed if sub-component)
        reset() { this.formResetCallback() };

    }
);
