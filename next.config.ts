import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Les formulaires avec photos (demandes, services, interventions)
      // peuvent envoyer jusqu'à 4 fichiers de 5 Mo : la limite par défaut
      // de 1 Mo des Server Actions les bloquait (erreur 413).
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
