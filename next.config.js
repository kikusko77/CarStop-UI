/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    basePath: process.env.NEXT_PUBLIC_APP_BASE_PATH,
    assetPrefix: process.env.NEXT_PUBLIC_APP_BASE_PATH + '/',

    rewrites(){
        return [
            {
                source: '/',
                destination: '/dashBoard'
            }
        ]
    }
};

module.exports = nextConfig;