// ===== Import all required modules and components

// async function initialise(comp, options = {}) {
// }

//--- MAIN
// Determine extra URL for unique dependencies
const compUrlArray = import.meta.url.split('/');
const comp = compUrlArray[compUrlArray.length - 2];

const options = {
  dependencies: [
    [comp, 'dp-date']
  ]
}
//initialise(compUrl, options);
try {
  // Load base module if not already loaded
  if (typeof rtlib === 'undefined') window.rtlib = await import(`${compUrlArray.slice(0, -3).join('/')}/modules/rt.mjs`)
  // Initialise component
  rtlib.init(import.meta.url, options);
} catch (e) {
  console.error(e);
  throw e
}
