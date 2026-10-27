module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    // EAS supplies this as a secret file variable; local builds use the ignored file.
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ||
      config.android?.googleServicesFile ||
      "./google-services.json",
  },
});
