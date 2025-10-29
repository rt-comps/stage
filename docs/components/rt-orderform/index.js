// ===== Import all required modules and components

//--- MAIN
const options = {
  dependencies: [
    'rt-menuitem',
    'rt-itemdata',
    'rt-lineitem',
    'rt-pickuplocations',
    'rt-form-field'
  ]
}

// Start the initialisation
try {
  // Load base module if not already loaded
  if (typeof rtlib === 'undefined') window.rtlib = await import(`${import.meta.url.split('/').slice(0, -3).join('/')}/modules/rt.mjs`)
  // Initialise component
  rtlib.init(import.meta.url, options);
} catch (e) {
  console.error(e);
  throw e
}