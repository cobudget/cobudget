// @ts-check

const { PHASE_PRODUCTION_BUILD } = require("next/constants");

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = (phase) => {
  const isProd = phase === PHASE_PRODUCTION_BUILD;

  const env = {
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    GRAPHQL_SUBSCRIPTIONS_URL: process.env.GRAPHQL_SUBSCRIPTIONS_URL,
    IS_PROD: String(isProd),
    DEPLOY_URL: process.env.DEPLOY_URL,
    SINGLE_GROUP_MODE: process.env.SINGLE_GROUP_MODE,
    TERMS_URL: process.env.TERMS_URL,
    TERMS_UPDATED_AT: process.env.TERMS_UPDATED_AT,
    PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL,
    PLATFORM_NAME: process.env.PLATFORM_NAME,
    BUCKET_NAME_SINGULAR: process.env.BUCKET_NAME_SINGULAR,
    BUCKET_NAME_PLURAL: process.env.BUCKET_NAME_PLURAL,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    ERROR_REPORTING_WEBHOOK: process.env.ERROR_REPORTING_WEBHOOK,
    HELPSCOUT_KEY: process.env.HELPSCOUT_KEY,
    LANDING_PAGE_URL: process.env.LANDING_PAGE_URL,
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    SKIP_RECAPTCHA: process.env.SKIP_RECAPTCHA,
  };

  return withBundleAnalyzer({
    env,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      // TODO: Fix remaining type errors from major version upgrades
      // This allows production builds to complete while types are being fixed
      ignoreBuildErrors: true,
    },
    compiler: {
      styledComponents: true,
    },
    transpilePackages: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/lab",
      "@mui/x-date-pickers",
      "@mui/system",
    ],
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        "styled-components": require.resolve("styled-components"),
      };
      return config;
    },
  });
};

module.exports = nextConfig;
