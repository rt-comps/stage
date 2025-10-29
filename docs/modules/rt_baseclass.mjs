// ================================================================
// Extend the HTMLElement class with methods commonly used by
// Roads Technology

class RTBaseClass extends HTMLElement {

  //--- $attr
  // Wrapper to manipulate an element's attribute.  
  $attr(name, newValue) {
    // If 'newValue' not defined then attempt to return attribute value
    if (newValue === undefined) return this.getAttribute(name);
    return this.setAttribute(name, newValue);
  }

  //--- $attr2NumArray
  // Convert a comma delimited text string of numbers into an array
  $attr2NumArray(attr, delimiter = ',') {
    // e.g. String "1,2,3" => Array [1,2,3]
    if (this.$attr !== null ) {
      return this.$attr(attr)
        .split(delimiter)
        .map(x => Number(x));
    } else console.error('$attr2NumArray(): ',attr, 'does not exist')
  }

  //--- $createElement
  // Wrapper for document.createElement()
  $createElement(
    {
      tag = "div", //     string OR existing DOM element
      innerHTML = ``, //  capture now so append can append childelements after it
      cssText = ``, //    String of CSS REPLACES existing styles
      classes = [], //    array of class name strings
      styles = {}, //     object with css properties
      attrs = {}, //      {name:value}
      append = [], //     Array of DOM elements to append
      prepend = [], //    Array of DOM elements to prepend
      ...props //         any other properties AND EventHandlers
    } = {}
  ) {
    // Create the new element
    let newEl = typeof tag == "string" ? document.createElement(tag) : tag;
    // Replace any default CSS if new string provided
    cssText && (newEl.style.cssText = cssText);
    // Set any provided attributes
    Object.keys(attrs).map((key) => newEl.setAttribute(key, attrs[key]));
    // Update any specific styles
    Object.keys(styles).map((key) => (newEl.style[key] = styles[key]));
    // Add any CSS class names provided
    classes.length > 0 && newEl.classList.add(...classes);
    // Set innerHTML if provided
    innerHTML && (newEl.innerHTML = innerHTML);
    // Prepend and append any elements provided
    newEl.prepend(...prepend.flat());
    newEl.append(...append.flat());

    // Copy any other properties provided and return the element
    return Object.assign(newEl, props)
  }

  //--- $dispatch
  // Simplified event dispatch with options provided as an object
  $dispatch({
    name = "name_not_provided", // EventName
    // Option defaults
    detail = {}, // event.detail
    bubbles = true, // default, bubbles up the DOM
    composed = true, // default, bubble up beyond shadowRoots
    cancelable = true, // default, cancelable event bubbling
    // optional overwrite whole options settings, or use already specified options
    options = {
      bubbles,
      composed,
      cancelable,
      detail
    },
    eventbus = this, // default dispatch from current this element or use something like eventbus:document
    //    once = false, // default .dispatchEvent option to execute a Listener once
    //    silent = false, // default log to console, so each dispatch can be execute quietly with silent:true
  }) {
    //console.warn("%c EventName:", "background:yellow", name, [detail]);
    eventbus.dispatchEvent(new CustomEvent(name, options));//, once );
  }

  //--- $euro
  // format number as Euro (NL) currency string
  $euro(value, locale = 'nl-NL') {
    return Intl.NumberFormat(locale, {
      style: "currency",
      currency: "eur",
    }).format(value);
  }

  //--- $getTemplate
  // Returns an HTML node based on the contents of a named <template> section in the document.head
  // NB: Assumes that the <template> element was created previously using loadComponent()!
  $getTemplate(template_id = this.nodeName) {
    let template = document.getElementById(template_id);
    if (template) return template.content.cloneNode(true);
    else {
      console.warn("Template not found:", template_id);
      return document.createElement("span");
    }
  }

  //--- $localeDate
  // Formate a date object to locale (default NL)  string
  $localeDate(date, locale = 'nl-NL', options = {}) {
    return Intl.DateTimeFormat(locale, options).format(date);
  }

  $map2JSON(map){
    return JSON.stringify(Object.fromEntries(map))
  }

  $JSON2map(string){
    return new Map(Object.entries(JSON.parse(string)))
  }
}

export { RTBaseClass };