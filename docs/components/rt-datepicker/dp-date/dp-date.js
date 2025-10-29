// ================================================================
// === dp-date class definition

// Recover component name from URL
const [compName] = rtlib.parseCompURL(import.meta.url);

// Remove enclosing component from compName
customElements.define(compName.slice(compName.lastIndexOf('/') + 1),
    class extends rtBC.RTBaseClass {
        // Private class fields
        #_sR;                   // Holds shadowRoot node
        // #_locale;               // What locale to use for text display 
        #_date = new Date();    // Date object holding current date

        //+++ Lifecycle Events
        //--- constructor
        constructor() {
            super();
            this.#_sR = this.attachShadow({ mode: "open" })
            this.#_sR.append(this.$getTemplate());

            //--- Respond to 'click' event
            this.#_sR.querySelector('#container').addEventListener('click', () => this.pickDate());
        }

        //--- connectedCallback
        connectedCallback() {
            setTimeout(() => {
                if (this.parentNode) {
                    //--- Re-render if notified that parentNode._week has been modified
                    this.parentNode.addEventListener('changeWeek', () => this.render());
                    //--- Reset 'chosen' CSS when notified that a change in choice has been made
                    this.parentNode.addEventListener('choiceMade', (e) => this.reset(e));
                    // Calculate initial date text
                    this.render()
                } else console.error(`${this.localName} - Could find parent`);
            });
        }

        //--- attributeChangedCallback
        // Re-render if the invalid attribute is altered
        static get observedAttributes() { return ['invalid'] };
        attributeChangedCallback() { this.render(); }
        //+++ End of Lifecycle Events

        //--- getMonth
        // Provide the correct

        //--- render
        // Calculate the correct date text and state for this component.
        // Only called if parentNode exists
        render() {
            if (this.hasAttribute('day')) {
                // Start by determining today's date
                const today = new Date();
                // A useful value
                const dateId = parseInt(this.$attr('day'));
                const currentWeek = this.parentNode._week || 0;

                // Disable date if calculated as in the past or labelled as invalid - color used as enable/disable flag
                this.#_sR.querySelector('#container').style.color = ((this.hasAttribute('invalid') || (currentWeek === 0 && (today.getDay() > dateId))) ? "rgb(204,204,204)" : "rgb(0,0,0)");

                /// Determine what the date object value for this instance should be
                // Reset #_date to today
                this.#_date = today;
                // Modify #_date to the correct value in a way that handles a month boundary when required
                this.#_date.setDate(today.getDate() + (7 * currentWeek) + (dateId - today.getDay()));

                /// Perform value rendering
                // localised day name
                this.#_sR.querySelector('#day').innerHTML = this.$localeDate(this.#_date, this.parentNode._locale, { weekday: 'short' });
                // localised date
                this.#_sR.querySelector('#date').innerHTML = `${this.#_date.getDate()} ${this.$localeDate(this.#_date, this.parentNode._locale, { month: 'short' })}`;
            } else {
                // What do render when there is no 'day' attribute
                this.#_sR.querySelector('#day').innerHTML = 'ERROR';
                this.#_sR.querySelector('#date').innerHTML = '...';
            }
        }

        //--- pickDate
        // Respond to click on component by sending an event holding date data ...unless date is disabled
        pickDate() {
            const cont = this.#_sR.querySelector('#container');
            // Check this component is enabled
            if (cont.style.color == "rgb(0, 0, 0)") {
                // Highlight choice
                cont.classList.add('chosen');
                // Send choice
                this.$dispatch({
                    name: 'datepicked',
                    detail: {
                        date: this.#_date,
                        day: this.$attr('day')
                    }
                });
            }
        }
        //--- reset
        // Reset chosen CSS if this is not the chosen element
        reset(e) {
            if (!this.hasAttribute('invalid')) {
                if (this.$attr('day') !== e.detail.day) this.#_sR.querySelector('#container').classList.remove('chosen');
            }
        }
    }
);