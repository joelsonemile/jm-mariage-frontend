export const environment = {
  production: true,
  // Repointé temporairement vers l'EC2 existant (toujours actif et à jour) le
  // temps que le service Render soit créé — voir render.yaml côté backend
  // pour la config prête à migrer (URL à changer ici une fois Render en ligne).
  apiUrl: 'https://13-39-93-209.nip.io/api',
  socketUrl: 'https://13-39-93-209.nip.io',
};
