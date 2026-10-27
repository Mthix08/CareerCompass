const fs = require("node:fs");

module.exports = ({ config }) => {
  const easFile = process.env.GOOGLE_SERVICES_JSON;
  const localFile = config.android?.googleServicesFile || "./google-services.json";

  return {
    ...config,
    android: {
      ...config.android,
      // Prefer the EAS secret-file path only when it exists; otherwise use the
      // local config file included in the EAS archive by .easignore.
      googleServicesFile: easFile && fs.existsSync(easFile) ? easFile : localFile,
    },
  };
};
