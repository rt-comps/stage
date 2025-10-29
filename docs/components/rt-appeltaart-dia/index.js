// ===== Import all required modules and components

async function initialise(comp, options = {}) {
  try {
    // Load base module if not already loaded
    if (typeof rtlib === 'undefined') window.rtlib = await import(`${comp.split('/').slice(0, -3).join('/')}/modules/rt.mjs`)
    // Initialise component
    rtlib.init(comp, options);
  } catch (e) {
    console.warn(e);
  }
}

//--- MAIN
const options = {
  dependencies: [
    'rt-orderform',
    'rt-datepicker'
  ],
  additionalModules: [
    {
      label: 'rtform',
      file: 'rt_form.mjs'
    }
  ]
}
initialise(import.meta.url, options);
