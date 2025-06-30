/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/send-email",
        destination: "https://asbeatcloudmailer.vercel.app/send-email",
      },
      {
        source: "/verification",
        destination: "https://asbeatcloudmailer.vercel.app/verification",
      },
      {
        source: "/welcome",
        destination: "https://asbeatcloudmailer.vercel.app/welcome",
      },
      {
        source: "/loginmessage",
        destination: "https://asbeatcloudmailer.vercel.app/loginmessage",
      },
      // Add more routes as needed (e.g., /resetpassword)
    ];
  },
  env: {
    API_URL: "https://asbeatcloudmailer.vercel.app",
  },
  // Optional: Add headers for CORS if needed in production
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, // Adjust for production
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;