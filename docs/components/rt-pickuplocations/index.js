// ===== Import all required modules and components

// Define options
const options = {
  // Requires following components
  dependencies: [
    'rt-datepicker'
  ]
}

try {
  // Load base module if not already loaded
  if (typeof rtlib === 'undefined') window.rtlib = await import(`${import.meta.url.split('/').slice(0, -3).join('/')}/modules/rt.mjs`)
  // Initialise component
  rtlib.init(import.meta.url, options);
} catch (e) {
  console.warn(e);
}

