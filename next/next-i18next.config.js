const i18nextHttpBackend = require('i18next-http-backend/cjs')

module.exports = {
  backend: {
    loadPath: "http://localhost:5555/api/translate/locales/{{lng}}/{{ns}}",
  },
  i18n: {
    locales: ["vi", "en"],
    defaultLocale: "vi",
    localeDetection: false,
    returnEmptyString: false,
    // debug: true,
    serializeConfig: false,
  },
  ns: ["common"],
  // reloadOnPrerender: true,
  partialBundledLanguages: true,
  use:[i18nextHttpBackend]
};