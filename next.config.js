"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('next').NextConfig} */
var nextConfig = {
    reactStrictMode: true,
    experimental: {},
    env: {
        NEXT_PUBLIC_MAILER_API_URL: process.env.NEXT_PUBLIC_MAILER_API_URL,
    },
};
exports.default = nextConfig;
