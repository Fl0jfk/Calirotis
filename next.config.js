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
    // Uniquement des valeurs non sensibles : ne jamais mettre clés AWS / mots de passe / SMTP ici —
    // Next les inclut dans le build et elles peuvent être exposées au bundle client.
    env: {
        BUCKET_NAME: process.env.BUCKET_NAME || process.env.STORAGE_BUCKET || process.env.S3_BUCKET_NAME || "",
        REGION: process.env.REGION || process.env.STORAGE_REGION || process.env.AWS_REGION || "eu-west-3",
    },
}

module.exports = nextConfig