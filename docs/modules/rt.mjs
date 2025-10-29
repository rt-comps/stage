// ================================================================
// const html = (strings, ...values) =>
//   String.raw({ raw: strings }, ...values);

// ================================================================
// Initialise a component.
//
// compName : URL of calling module
// options  : Object 
// 
async function init(compURL, options = {}) {

  const [compName, basePath] = parseCompURL(compURL);

  // Attempt to load any specified additional modules
  if (typeof options.additionalModules !== 'undefined') {
    try {
      await loadMods(basePath, options.additionalModules)
    } catch (e) {
      // Stop further loading if any modules fail to load
      console.error(e);
      throw e;
    }
  }

  // Timer start (informational)
  console.time(`load Modules for ${compName}`);
  // Trigger the Loading of all dependencies
  if (typeof options.dependencies !== 'undefined') {
    await Promise.all(options.dependencies.map(async (depComp) => {
      try {
        await import(`${basePath}/components/${depComp.constructor === Array ? depComp.join('/') : depComp}/index.js`);
      } catch (e) {
        throw `Component "${compName}" could not load dependency "${depComp}" so stopping!!`;
      }
    }));
  }

  // Stop timer
  console.timeEnd(`load Modules for ${compName}`);
  // return

  // Load this component
  try {
    await loadComponent(compURL);
  } catch (e) {
    throw e.stack
  }
}

// ================================================================
// Load a new component.
//
// url      : URL of calling file - assumed it is in component directory
// version  : Numeric version of code to use
// 
async function loadComponent(url, version = false) {
  // Parse URL in to useful values
  const [compDir, basePath] = parseCompURL(url);
  // Filename is directory name plus version string (if provided)
  const compFile = `${compDir}${version ? '_v' + version : ''}`;
  // Build file path (excluding file extension)
  const baseFile = `${basePath}/components/${compDir}/${compDir.includes('/') ? compFile.slice(compFile.lastIndexOf('/') + 1) : compFile}`;
  // Import the components HTML file into the document.head
  // then load the component code
  try {
    await loadTemplate(`${baseFile}.html`);
    await import(`${baseFile}.js`);
  } catch (e) {
    console.log(e)
    throw e
  }
}

// ================================================================
// Load modules in to global scope
//
// basePath   : URL where 'modules' directory can be found
// addModules : Additional modules to load
// 
async function loadMods(basePath, addModules = []) {
  // Define modules to load
  //  Default module(s) to load
  const defaultModules = [
    { label: 'rtBC', file: 'rt_baseclass.mjs' }
  ];
  //  Additional modules to load list
  const modules = defaultModules.concat(addModules);

  // Initiate the loading any missing modules
  return Promise.all(modules.map(async (module) => {
    // Attempt to load module when not present
    if (typeof window[module.label] === 'undefined') {
      try {
        window[module.label] = await import(`${basePath}/modules/${module.file}`);
      } catch (e) {
        throw `module "${module.label}" failed to load`;
      }
    }
    return window[module.label];
  }));
}

// ================================================================
// Add a component's template to document.head
//
// url  : URL of template file.  Must be absolute
//
async function loadTemplate(url) {
  // return the value from the end of this chain
  try {
    const response = await fetch(url);
    if (!response.ok) throw `Failed to load ${url} with status ${response.status}`;
    const htmlText = await response.text();
    document.head.insertAdjacentHTML('beforeend', htmlText)
  } catch (e) {
    console.log(`loadTemplate() - ${e}`)
    throw e;
  }
}

// ================================================================
// Split a URL in to component name and base path
// 
// Returns ["<componentDir>","<baseDirOfAllFiles>"]
// 
function parseCompURL(url) {
  // Split URL into array using / as delimiter
  // 'http://test:5500/mypath/components/filename' => ['http','',test:5500','mypath','components','filename']
  const urlArray = url.split('/');

  // Only return something if passed a string that has some meaning, ie more than the just the FQDN + '/components/'
  if (urlArray.length > 4 && urlArray.includes('components')) {
    // return component name + directory containing all components & modules
    return [
      // Component name (including any enclosing components)
      urlArray.slice(urlArray.indexOf('components') + 1, urlArray.length - 1).join('/'),
      // Base path for URL
      url.slice(0, url.indexOf('/components'))
    ]
  }
}

// export { html, init, loadComponent, loadMods, parseCompURL };
export { init, loadComponent, loadMods, parseCompURL };