const options = {
  dependencies: [
    'rt-plusminus'
  ],
  additionalModules: [
    {
      label: 'rtform',
      file: 'rt_form.mjs'
    }
  ]
}
rtlib.init(import.meta.url, options);
