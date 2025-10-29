// ================================================================
// get component name from directory name
const [compName] = rtlib.parseCompURL(import.meta.url);

customElements.define(
  compName,
  class extends rtBC.RTBaseClass {
    // Allow this element to participate in forms
    static formAssociated = true;
    // Declare private class fields
    #_sR;
    #_internals;
    #_times;
    #_dates;

    //+++++ Lifecycle Events
    //--- constructor
    constructor() {
      super()
      // Attach contents of template - placed in document.head by rtlib.loadComponent()
      this.#_sR = this.attachShadow({ mode: "open" });
      this.#_sR.append(this.$getTemplate());

      // Expose form elements to parent form
      this.#_internals = this.attachInternals();

      // Useful nodes
      this.#_times = this.#_sR.querySelector('#fs-time');

      // Render Shadow DOM elements based on provided HTML
      this.#render();

      //###### Event Listeners
      // Update 'times' when a 'location' is selected.
      // By using an object as the Listener we get two benefits
      //  - The current context of 'this' can be transferred, like using an arrow function
      //  - The object can be used to remove the listener, not possible with an arrow function 
      const changeFunc = {
        handleEvent: this.#updateRadio,
        pickLoc: this
      }
      this.#_sR.querySelector('#container').addEventListener('change', changeFunc);
    }

    //--- connectedCallBack
    connectedCallBack() {
      // Look for and pull in external style definition only when component is connected to a form element
      if (typeof rtForm !== 'undefined' && rtForm.findNode(this, 'form')) rtForm.getStyle(this, rtForm.findNode(this));
      this.#_dates = this.#_sR.querySelector('#container rt-datepicker')
    }

    //--- formAssociatedCallback
    // triggered when component is added to (or removed from) a form
    formAssociatedCallback() {
      // Only do something if this is an association
      if (this.#_internals.form) {
        // Attach a listener to update the form values for this component when form is submitted
        this.#_internals.form.addEventListener('formdata', (e) => {
          // Add location value
          const location = this.#_sR.querySelector('input[name="location"]:checked');
          e.formData.append(`pickup-location`, location ? location.value : '');
          // Add time-slot value
          const time = this.#_sR.querySelector('input[name="time-slot"]:checked');
          e.formData.append(`pickup-time`, time ? time.value : '');
          // Add date value (if present)
          if (this.#_dates) e.formData.append('pickup-date', this.#_dates.value);
        });
      }
    }

    //--- formResetCallback
    // respond to the enclosing form being reset
    formResetCallback() {
      // Uncheck any radio button selections
      [...this.#_sR.querySelectorAll('input:checked')].forEach(el => el.checked = false);
      // Make time slots DIV hidden
      this.#_times.hidden = true;
      // Reset date picker (if present)
      if (this.#_dates) this.#_dates.reset();
    }
    //+++++ End of Lifecycle Events

    //--- #render
    // Populate the shadow DOM
    #render() {
      // Find all location entries
      const nodes = [...this.querySelectorAll('pu-loc')];
      // Check there is something to do
      if (nodes.length > 0) {
        const _createRadioLabel = (name, value) =>
          this.$createElement({
            tag: 'label',
            append: [
              this.$createElement({
                tag: 'input',
                type: 'radio',
                name,
                value,
                required: true
              }),
              this.$createElement({
                tag: 'span',
                innerHTML: `&nbsp;${value}`
              })
            ]
          });

        // Create location radio buttons
        this.#_sR.querySelector('fieldset#pickup').append(...nodes.map(element => _createRadioLabel('location', element.id)));

        // Create time slot radio button sets
        this.#_sR.querySelector('fieldset#pu-times').append(...nodes.map(element => {
          // Declare return value
          let newEl;
          // Get timeslots for radio buttons
          const innerNodes = [...element.querySelectorAll('time-slot')];
          // Process time slot info into array of nodes
          if (innerNodes.length) {
            const toAppend = [...innerNodes.map(el => _createRadioLabel('time-slot', el.innerHTML))];
            // Create the <div> to hold this location's time slots and append time slot data nodes
            newEl = this.$createElement({
              tag: 'div',
              id: `rad-${element.id}`,
              hidden: true,
              append: toAppend
            })
          }
          // Return complete node to map function
          return newEl;
        }));

        /// Add & initialise Date Picker if required
        // Look for <pu-dates> element
        const puDate = this.querySelector('pu-dates');
        // If found create an rt-datepicker component from the provided attributesß
        if (puDate) {
          // Create object for transfer of attributes to new element
          const attrs = {};
          const elAttrs = puDate.attributes;
          for (let x = 0; x < elAttrs.length; x++) {
            const elAttr = elAttrs.item(x);
            attrs[elAttr.name] = elAttr.value;
          }
          // Append newly created component at end of container
          this.#_sR.querySelector('#container').append(this.$createElement({
            tag: 'rt-datepicker',
            attrs
          }))
          // Assign new element to private field
          this.#_dates = this.#_sR.querySelector('#container rt-datepicker')
        }
      }
    }

    //--- #updateRadio
    // Update pickup times when user selects location
    // Expected that Listener is added with object
    #updateRadio(e) {
      let pickupLoc = this
      if (e instanceof Event) {
        e.stopPropagation();
        pickupLoc = this.pickLoc;
        // Was location chosen
        if (e.target.getAttribute('name') === 'location') {
          // Cycle through possible time-slot child nodes, unhide the correct one and hide all the others
          const allNodes = [...e.currentTarget.querySelectorAll('fieldset div')];
          allNodes.forEach(element => {
            if (element.id === `rad-${e.target.value}`) element.hidden = false;
            else element.hidden = true;
          })

          // Unhide DIV containing all 'times' on the first time a location is chosen
          if (pickupLoc.#_times.hidden === true) pickupLoc.#_times.hidden = false;
        }
        // When time chosen then display date picker
        if (e.target.getAttribute('name') === 'time-slot') {
          // Unhide date picker on the first time a time-slot is chosen
          if (pickupLoc.#_dates.hidden === true) pickupLoc.#_dates.hidden = false;
        }
        return
      }

      // When called manually, uncheck any previously checked radio buttons
      const isChecked = pickupLoc.#_sR.querySelectorAll('#container input[name="time-slot"]:checked')
      if (isChecked) isChecked.checked = false;
    }

    //### Expose some standard form element properties and methods
    //--- checkValidity
    // Ensure a value has been chosen
    checkValidity() {
      const flags = new Map([
        ['valid', true]
      ]);

      // Check radio buttons have been selected for both field sets
      ['location', 'time-slot'].forEach(field => {
        // Did a previous field set fail?
        if (flags.get('valid')) {
          // Fail if this field set doesn't have a checked value
          if (!this.#_sR.querySelector(`input[name="${field}"]:checked`)) {
            flags.set('valid', false);
            flags.set('field', `pickup-location: ${field}`);
          }
        }
      })

      // If all good so far, check that a date had been chosen
      if (flags.get('valid') && this.#_dates) return this.#_sR.querySelector('rt-datepicker').checkValidity();
      // If this point is reached then location or time-slot not 
      else return flags
    }

    //--- focus
    // Push focus to correct element
    //  Expected value of field is 'pickup-location: <inputName>'
    focus(field) {
      // Strip prefix
      const fieldName = field.replace(/^pickup-location: /, '');
      // Choose focus
      switch (fieldName) {
        case 'location':
          this.#_sR.querySelector('#fs-pickup').focus({ focusVisible: true });
          break;
        case 'time-slot':
          this.#_sR.querySelector('#fs-time').focus({ focusVisible: true });
          break;
        default:
          // Shouldn't get here if rt-datepicker not present
          this.#_dates.focus();
      }
    }
  }
);

