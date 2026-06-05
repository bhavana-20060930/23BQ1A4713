/** @type {import("next").NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/notifications",
        destination: "http://4.224.186.213/evaluation-service/notifications",
      },
    ];
  },
};
module.exports = nextConfig;
