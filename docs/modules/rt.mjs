async function init(compURL, options = {}) {
    const [ compName, basePath ] = parseCompURL(compURL);
    if (typeof options.additionalModules !== "undefined") {
        try {
            await loadMods(basePath, options.additionalModules);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
    console.time(`load Modules for ${compName}`);
    if (typeof options.dependencies !== "undefined") {
        await Promise.all(options.dependencies.map(async depComp => {
            try {
                await import(`${basePath}/components/${depComp.constructor === Array ? depComp.join("/") : depComp}/index.js`);
            } catch (e) {
                throw `Component "${compName}" could not load dependency "${depComp}" so stopping!!`;
            }
        }));
    }
    console.timeEnd(`load Modules for ${compName}`);
    try {
        await loadComponent(compURL);
    } catch (e) {
        throw e.stack;
    }
}

async function loadComponent(url, version = false) {
    const [ compDir, basePath ] = parseCompURL(url);
    const compFile = `${compDir}${version ? "_v" + version : ""}`;
    const baseFile = `${basePath}/components/${compDir}/${compDir.includes("/") ? compFile.slice(compFile.lastIndexOf("/") + 1) : compFile}`;
    try {
        await loadTemplate(`${baseFile}.html`);
        await import(`${baseFile}.js`);
    } catch (e) {
        console.log(e);
        throw e;
    }
}

async function loadMods(basePath, addModules = []) {
    const defaultModules = [ {
        label: "rtBC",
        file: "rt_baseclass.mjs"
    } ];
    const modules = defaultModules.concat(addModules);
    return Promise.all(modules.map(async module => {
        if (typeof window[module.label] === "undefined") {
            try {
                window[module.label] = await import(`${basePath}/modules/${module.file}`);
            } catch (e) {
                throw `module "${module.label}" failed to load`;
            }
        }
        return window[module.label];
    }));
}

async function loadTemplate(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw `Failed to load ${url} with status ${response.status}`;
        const htmlText = await response.text();
        document.head.insertAdjacentHTML("beforeend", htmlText);
    } catch (e) {
        console.log(`loadTemplate() - ${e}`);
        throw e;
    }
}

function parseCompURL(url) {
    const urlArray = url.split("/");
    if (urlArray.length > 4 && urlArray.includes("components")) {
        return [ urlArray.slice(urlArray.indexOf("components") + 1, urlArray.length - 1).join("/"), url.slice(0, url.indexOf("/components")) ];
    }
}

export {
    init,
    loadComponent,
    loadMods,
    parseCompURL
};