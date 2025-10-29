// ===== Import all required modules and components

// Define options
const options = {
  // Required components this component depends on
  dependencies: [
    'rt-orderform',
    'rt-datepicker'
  ],
  // Modules desired in addition to base module and base class
  additionalModules: [
    {
      label: 'rtForm',
      file: 'rt_form.mjs'
    }
  ]
}
// Start the initialisation
try {
  // Load base module if not already loaded
  if (typeof rtlib === 'undefined') window.rtlib = await import(`${import.meta.url.split('/').slice(0, -3).join('/')}/modules/rt.mjs`);
  // Initialise component
  rtlib.init(import.meta.url, options);
} catch (e) {
  console.error(e);
  throw e
}
