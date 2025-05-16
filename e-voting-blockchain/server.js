require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Web3 = require("web3").default; // Fix for latest web3 version
const contractABI = require("./build/contracts/Voting.json"); // Ensure this exists
const ipfsClient = require("ipfs-http-client");

// ✅ IPFS Authentication
const projectId = "06e7773baa7a469e9bf7ae79cd102410";
const projectSecret = "BG1LW3xwGg/LnJDHkyOodm+szw97Tp4sJOjE7cYwAFXs5tjptvI4hQ";
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// ✅ Connect to IPFS
const ipfs = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

console.log("✅ Connected to IPFS!");

// ✅ Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to Blockchain
const web3 = new Web3("http://127.0.0.1:8545"); // Ensure Ganache is running
const contractAddress = "0x6989D366fa8a6dA50dC37055861a5b3DC3F314cE"; // Replace with actual address
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

// ✅ Store Vote on IPFS
async function storeVoteOnIPFS(voter, candidateId) {
  try {
    const voteData = JSON.stringify({ voter, candidateId, timestamp: Date.now() });
    const { path } = await ipfs.add(voteData);
    console.log("Vote stored on IPFS: https://ipfs.io/ipfs/" + path);
    return path;
  } catch (error) {
    console.error("IPFS Upload Error:", error);
    throw new Error("Failed to store vote on IPFS");
  }
}

// ✅ Get Candidates List
app.get("/api/candidates", async (req, res) => {
  try {
    const candidatesCount = await contract.methods.candidatesCount().call();
    let candidates = [];
    for (let i = 1; i <= candidatesCount; i++) {
      let candidate = await contract.methods.candidates(i).call();
      candidates.push({
        id: candidate.id,
        name: candidate.name,
        voteCount: candidate.voteCount,
      });
    }
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Vote Endpoint
app.post("/api/vote", async (req, res) => {
  const { voterAddress, candidateId } = req.body;
  try {
    await contract.methods.vote(candidateId).send({ from: voterAddress });

    // Store the vote in IPFS
    const ipfsHash = await storeVoteOnIPFS(voterAddress, candidateId);

    res.json({ success: true, message: "Vote cast successfully!", ipfsHash });
  } catch (error) {
    console.error("Vote Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the E-Voting Blockchain System!");
});

// ✅ Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
