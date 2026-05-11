/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        formats : ['image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'd33wubrfki0l68.cloudfront.net'
            },
            {
                protocol: 'https',
                hostname: 'calirotisassets.s3.eu-west-3.amazonaws.com'
            },
            {
                protocol: 'https',
                hostname: 'calirotis.s3.eu-west-3.amazonaws.com'
            },
            {
                protocol: 'https',
                hostname: '**.googleusercontent.com',
                port:""
            }
        ]
    },
}

module.exports = nextConfig