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
    // Inline runtime config for Amplify:
    // Next will replace these values during build, so SSR routes can still resolve S3 bucket/region
    // even if Amplify doesn't provide env vars to the runtime process.
    env: {
        BUCKET_NAME: process.env.BUCKET_NAME || process.env.STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "",
        REGION:
            process.env.REGION || process.env.STORAGE_REGION || process.env.AWS_REGION || "eu-west-3",
    },
}

module.exports = nextConfig