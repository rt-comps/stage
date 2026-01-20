const compUrlArray = import.meta.url.split("/");

const comp = compUrlArray[compUrlArray.length - 2];

const options = {
    dependancies: [ [ comp, "al-allergen" ] ]
};

try {
    if (typeof rtlib === "undefined") window.rtlib = await import(`${compUrlArray.slice(0, -3).join("/")}/modules/rt.mjs`);
    rtlib.init(import.meta.url, options);
} catch (e) {
    console.error(e);
    throw e;
}