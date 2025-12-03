const express = require("express");
const path = require("path");
const nacl = require("tweetnacl");
const naclUtil = require("tweetnacl-util");

const app = express();
const PORT = 3311;

// --- MIDDLEWARE ---
// This allows us to read the data sent from the Pug form
app.use(express.urlencoded({ extended: true }));

// Setup Pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// --- WARP LOGIC ---
const API_BASE = "https://api.cloudflareclient.com/v0a2408";
const HEADERS = {
  "User-Agent": "okhttp/3.12.1",
  "CF-Client-Version": "a-6.3-1922",
  "Content-Type": "application/json",
};

function generateKeys() {
  const keyPair = nacl.box.keyPair();
  return {
    privateKey: naclUtil.encodeBase64(keyPair.secretKey),
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
  };
}

function getTimestamp() {
  return new Date().toISOString();
}

// Function now accepts "options" object from the user
async function generateConfig(options) {
  const keys = generateKeys();

  // 1. Register Account
  const regBody = {
    key: keys.publicKey,
    install_id: "",
    fcm_token: "",
    tos: getTimestamp(),
    model: "PC",
    serial_number: "",
    locale: "en_US",
  };

  const response = await fetch(`${API_BASE}/reg`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(regBody),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const config = data.config;
  const peer = config.peers[0];
  const interfaceAddressV4 = config.interface.addresses.v4;
  const interfaceAddressV6 = config.interface.addresses.v6;

  // 2. Use User Options or Defaults
  // If user left it blank, use the default string "OR" (||) values
  const userDNS = options.dns || "1.1.1.1, 2606:4700:4700::1111";
  const userMTU = options.mtu || "1280";
  const userEndpoint = options.endpoint || peer.endpoint.host; // Use Cloudflare default if blank
  const userAllowedIPs = options.allowedips || "0.0.0.0/0, ::/0";
  const userKeepAlive = options.keepalive
    ? `PersistentKeepalive = ${options.keepalive}`
    : "";

  // 3. Build the Config File
  const confContent = `[Interface]
PrivateKey = ${keys.privateKey}
Address = ${interfaceAddressV4}, ${interfaceAddressV6}
DNS = ${userDNS}
MTU = ${userMTU}

[Peer]
PublicKey = ${peer.public_key}
AllowedIPs = ${userAllowedIPs}
Endpoint = ${userEndpoint}
${userKeepAlive}
`;

  return confContent;
}

// --- ROUTES ---

app.get("/", (req, res) => {
  res.render("index");
});

// Changed from GET to POST to handle form data
app.post("/download", async (req, res) => {
  try {
    console.log("Generating config with options:", req.body);

    // Pass the form body (req.body) to our generator
    const configContent = await generateConfig(req.body);

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="warp-custom.conf"'
    );
    res.setHeader("Content-Type", "text/plain");
    res.send(configContent);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating configuration.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
