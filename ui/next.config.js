// https://github.com/zeit/next.js/blob/canary/examples/with-env-from-next-config-js/next.config.js

const { PHASE_PRODUCTION_BUILD } = require("next/constants");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = (phase) => {
  const isProd = phase === PHASE_PRODUCTION_BUILD;

  const env = {
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    GRAPHQL_SUBSCRIPTIONS_URL: process.env.GRAPHQL_SUBSCRIPTIONS_URL,
    IS_PROD: isProd,
    DEPLOY_URL: process.env.DEPLOY_URL,
    SINGLE_GROUP_MODE: process.env.SINGLE_GROUP_MODE,
    TERMS_URL: process.env.TERMS_URL,
    TERMS_UPDATED_AT: process.env.TERMS_UPDATED_AT,
    PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL,
    PLATFORM_NAME: process.env.PLATFORM_NAME,
    BUCKET_NAME_SINGULAR: process.env.BUCKET_NAME_SINGULAR,
    BUCKET_NAME_PLURAL: process.env.BUCKET_NAME_PLURAL,
    REALITIES_DEPLOY_URL: process.env.REALITIES_DEPLOY_URL,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    ERROR_REPORTING_WEBHOOK: process.env.ERROR_REPORTING_WEBHOOK,
    // these are for realities
    REACT_APP_GRAPHQL_ENDPOINT: process.env.REACT_APP_GRAPHQL_ENDPOINT,
    REACT_APP_GRAPHQL_SUBSCRIPTION: process.env.REACT_APP_GRAPHQL_SUBSCRIPTION,
    HELPSCOUT_KEY: process.env.HELPSCOUT_KEY,
    LANDING_PAGE_URL: process.env.LANDING_PAGE_URL,
  };
  return withBundleAnalyzer({
    env,
    eslint: {
      ignoreDuringBuilds: true,
    },
    compiler: {
      styledComponents: true,
    },
  });
};
