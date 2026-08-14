# Deploying OneVoice Na to AWS EC2

Written for the Group Leader per the hackathon rules ("Group Leader will need to create an AWS account" and be the point of contact with AWS support). Two paths below — pick one. Path A (no Docker) is simpler and faster for a 24h build; Path B (Docker) is what the brief calls "encouraged but not required."

Do the AWS account creation step **first, today** — card verification can take a while and you don't want it blocking you at hour 20.

## 0. Prerequisites
- AWS account created, card verified (won't be charged for a free-tier EC2 instance kept small).
- An EC2 key pair downloaded (`.pem` file) for SSH access.

## 1. Launch the instance
1. EC2 console → **Launch instance**.
2. AMI: **Ubuntu Server 22.04 LTS** (free-tier eligible).
3. Instance type: **t2.micro** or **t3.micro** (free tier / cheap, plenty for a demo).
4. Key pair: select the one you downloaded.
5. Network settings → create/edit security group, allow inbound:
   - SSH (22) from your IP
   - HTTP (80) from anywhere (0.0.0.0/0)
   - (Optional) HTTPS (443) from anywhere, if you set up TLS
6. Launch. Note the **public IPv4 address** (or allocate an Elastic IP so it doesn't change on reboot — recommended before judging).

## 2. Connect
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<PUBLIC_IP>
```

## Path A — plain Node + PM2 (recommended for time pressure)

```bash
# On the EC2 instance:
sudo apt update && sudo apt install -y nodejs npm nginx git build-essential
sudo npm install -g pm2

git clone <your-repo-url> onevoice-na
cd onevoice-na/backend
cp .env.example .env
nano .env   # set GEMINI_API_KEY, ADMIN_USER, ADMIN_PASSWORD

npm install
npm run seed        # populate demo data before judging

pm2 start ../deploy/ecosystem.config.js
pm2 save
pm2 startup         # run the command it prints, so it survives reboot

sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/onevoice-na
sudo ln -s /etc/nginx/sites-available/onevoice-na /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Visit `http://<PUBLIC_IP>/health`, `/admin`, and `/map` from a phone on mobile data (not the venue wifi) to confirm it's genuinely public.

## Path B — Docker (optional, per the brief)

```bash
sudo apt update && sudo apt install -y docker.io nginx
sudo systemctl enable --now docker

git clone <your-repo-url> onevoice-na
cd onevoice-na/backend
cp .env.example .env
nano .env

sudo docker build -t onevoice-na-backend .
sudo docker run -d --name onevoice-na \
  --restart unless-stopped \
  -p 4000:4000 \
  --env-file .env \
  -v onevoice-na_data:/app/data \
  -v onevoice-na_uploads:/app/uploads \
  onevoice-na-backend

sudo docker exec onevoice-na node src/seed.js
```

Then set up nginx exactly as in Path A step (`cp ../deploy/nginx.conf ...`).

## 3. Point the mobile app at the deployed API
In `mobile/app.json` → `expo.extra.apiBaseUrl`, set `http://<PUBLIC_IP>` (or your domain), rebuild/restart Expo, and make sure judges' phones (or your demo phone) hit the live server, not localhost.

## 4. Before judging
- [ ] `/health` returns `{"ok":true}` from outside your own network.
- [ ] `/admin` loads and login works with the `.env` credentials.
- [ ] `/map` shows pins.
- [ ] Mobile app successfully submits a report and it appears in `/admin` within a few seconds.
- [ ] Elastic IP attached (so a reboot doesn't change your URL mid-event).
- [ ] `.env` committed nowhere — check `git status` before any push.
