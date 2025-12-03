# WARP Generator (Node.js)

Lightweight Node.js web app to create WireGuard configs for Cloudflare WARP (Warp+ style) using Cloudflare's client API. It's a small generator that produces a `warp-custom.conf` containing the interface and peer configuration, and supports custom options (Endpoint, DNS, MTU, Allowed IPs, KeepAlive).

You can use the example domain `wgcf.afandiazmi.com` for the Endpoint if you'd like to test the app.

---

## Features

- Simple web UI built with Pug + Tailwind CDN
- Generate WireGuard configuration with Cloudflare WARP (auto-generated keys)
- Quick manual override for Endpoint, DNS, MTU, Allowed IPs, KeepAlive
- Generates and prompts a file download (`warp-custom.conf`)

---

## Prerequisites

- Node.js 18+ (or latest stable LTS)
- npm

Optional

- `nodemon` for dev (`npm run dev`)

---

## Local Setup & Run (Windows / PowerShell)

1. Clone the repository and change into the folder:

```powershell
git clone https://github.com/afandiazmi/WGCF-Generator-Nodejs.git
cd WGCF-Generator-Nodejs
```

2. Install dependencies:

```powershell
npm ci
```

3. Start the server:

```powershell
npm start
```

4. Open `http://localhost:3311` in your browser.

Note: By default the server runs at port 3311. If you need to run on a different port, either modify `server.js` to use an environment variable (recommended) or change the hardcoded `PORT` variable. For example, update the `PORT` constant in `server.js` to:

```js
const PORT = process.env.PORT || 3311;
```

Or set the environment variable in PowerShell before running:

```powershell
$env:PORT = 8080; npm start
```

---

## Usage

- Visit `http://localhost:3311`.
- Select your mode: Auto (default) or Manual to provide custom values.
- Click `Generate Config` to download a `warp-custom.conf` file containing a working WireGuard configuration.

Notes:

- If you use a custom domain for `Endpoint`, please make sure you set the DNS record to "DNS only" (gray cloud) in Cloudflare — otherwise Cloudflare may block WireGuard traffic. The UI shows a warning for this.
- The app uses Cloudflare's client API endpoint (the app will register and fetch the WARP keys from Cloudflare), then generates key-pairs locally.

Example (using `wgcf.afandiazmi.com`):

- Set the Endpoint field to `wgcf.afandiazmi.com:2408` (or `wgcf.afandiazmi.com:2408` in the UI) and click Generate.
- For DNS, recommended defaults are `1.1.1.1, 2606:4700:4700::1111`.

---

## Deployment

Here are some suggested deployment options and instructions:

### Heroku (Simple)

1. Ensure `server.js` supports `process.env.PORT` (update if needed, as noted earlier).
2. Create a Heroku app and push your repo:

```bash
heroku create my-warp-generator
git push heroku main
```

Heroku will install dependencies and run `npm start` automatically. For production, set Node engine in `package.json` if desired.

### Docker (Generic)

1. Create a `Dockerfile` (example):

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3311
ENV PORT=3311
CMD ["npm", "start"]
```

2. Build and run:

```bash
docker build -t warp-gen .
docker run -p 3311:3311 warp-gen
```

### Platform-as-a-Service (Render/Railway/Vercel)

Platforms like Render or Railway will need the server to bind to `process.env.PORT`. If you need HTTPS or a custom domain, set your platform configuration to forward HTTP/HTTPS to your container.

---

## Troubleshooting

- API Errors: If the Cloudflare API returns an error, you may run into rate limits or Cloudflare may have changed the API — check console/logs for statuses.
- Endpoint issues: If you use a custom domain (like `wgcf.afandiazmi.com`), make sure it's set to DNS-only and resolves to an IP that forwards traffic (no Cloudflare proxy)
- UI errors: If the file doesn't download, check your browser console and Node.js server logs.

---

## Security & Privacy

- This app generates private keys locally in the server process and returns them to the browser via a config file. Do not share your private keys.
- Be aware of how Cloudflare's API is used — this repository is an educational/demo project.

---

## Contributing

If you want to contribute (feature request, bugfixes, or other), please create an issue or a Pull Request.

---

## License

ISC

---

## Acknowledgments

- Built by afandiazmi
