// https://github.com/zeit/next.js/blob/canary/examples/with-env-from-next-config-js/next.config.js

const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  const isProd = phase === PHASE_PRODUCTION_BUILD;

  const env = {
    GRAPHQL_URL: isDev
      ? "http://localhost:4000/graphql"
      : `https://${
          process.env.VERCEL_URL
            ? process.env.VERCEL_URL
            : process.env.DEPLOY_URL
        }/api`,
    IS_PROD: isProd,
    DEPLOY_URL: process.env.DEPLOY_URL,
  };
  return withBundleAnalyzer({
    env,
  });
};
