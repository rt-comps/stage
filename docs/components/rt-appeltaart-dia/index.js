async function initialise(comp, options = {}) {
    try {
        if (typeof rtlib === "undefined") window.rtlib = await import(`${comp.split("/").slice(0, -3).join("/")}/modules/rt.mjs`);
        rtlib.init(comp, options);
    } catch (e) {
        console.warn(e);
    }
}

const options = {
    dependencies: [ "rt-orderform", "rt-datepicker" ],
    additionalModules: [ {
        label: "rtform",
        file: "rt_form.mjs"
    } ]
};

initialise(import.meta.url, options);