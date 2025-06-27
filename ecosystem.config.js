module.exports = {
  apps: [
    {
      name: "po--backend",
      script: "node ./dist/index.js",
      cwd: "./po--backend",
      env: {
        NODE_ENV: "production",
        PORT: 7000,
      },
    },
    {
      name: "po-track-frontend",
      script: "npm",
      args: "start",
      cwd: "./po-track-frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3004,
      },
    },
  ],
};
