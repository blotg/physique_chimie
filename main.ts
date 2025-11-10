import { serveDir } from "@std/http/file-server";

const PORT = 8000;

// Serveur HTTP pour servir les fichiers statiques
Deno.serve({ port: PORT }, (req) => {
  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});

console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
console.log(`📚 Servez vos animations de physique-chimie depuis le dossier public/`);
