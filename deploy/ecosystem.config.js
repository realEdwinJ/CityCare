// PM2 process manager config. On the EC2 box, from backend/:
//   pm2 start ../deploy/ecosystem.config.js
//   pm2 save && pm2 startup   (so it survives reboot)
module.exports = {
  apps: [
    {
      name: "onevoice-na-backend",
      cwd: "./backend",
      script: "src/server.js",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "300M",
    },
  ],
};
