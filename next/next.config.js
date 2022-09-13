const dotenv = require("dotenv");
dotenv.config();

const withPlugins = require("next-compose-plugins");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
// const withTM = require("next-transpile-modules");
// const { i18n } = require("./next-i18next.config");

module.exports = withPlugins(
  [
    [withBundleAnalyzer({})],
    // , [withTM(["lodash-es"])]
  ],
  {
    publicRuntimeConfig: {
      firebaseView: process.env.FIREBASE_VIEW,
      version: process.env.npm_package_version,
    },
    swcMinify: true,
    
  }
);
