import nextConfig from "eslint-config-next/core-web-vitals";

export default [
  ...nextConfig,
  {
    rules: {
      "no-unused-vars": "off",
      "no-console": "off",
      eqeqeq: "off",
    },
  },
];
