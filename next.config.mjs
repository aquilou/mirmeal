/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    const appHost = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.mirmeal.es").replace(/^https?:\/\//, "");
    // mirmeal.es solo sirve la landing ("/"); cualquier otra ruta (menú, login,
    // checkout...) se hace siempre en app.mirmeal.es.
    return [
      {
        source: "/:path+",
        has: [{ type: "host", value: "mirmeal.es" }],
        destination: `https://${appHost}/:path+`,
        permanent: false,
      },
      {
        source: "/:path+",
        has: [{ type: "host", value: "www.mirmeal.es" }],
        destination: `https://${appHost}/:path+`,
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
