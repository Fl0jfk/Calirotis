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
    env: {
        BUCKET_NAME: process.env.BUCKET_NAME || process.env.STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "",
        REGION: process.env.REGION || process.env.STORAGE_REGION || process.env.AWS_REGION || "eu-west-3",
        ACCESS_KEY_ID: process.env.ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
        SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",    
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
        SMTP_USER: process.env.SMTP_USER || "",
        SMTP_PASS: process.env.SMTP_PASS || "",
    },
}

module.exports = nextConfig