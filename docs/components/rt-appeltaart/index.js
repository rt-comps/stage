const options = {
    dependencies: [ "rt-orderform", "rt-datepicker" ],
    additionalModules: [ {
        label: "rtForm",
        file: "rt_form.mjs"
    } ]
};

try {
    if (typeof rtlib === "undefined") window.rtlib = await import(`${import.meta.url.split("/").slice(0, -3).join("/")}/modules/rt.mjs`);
    rtlib.init(import.meta.url, options);
} catch (e) {
    console.error(e);
    throw e;
}