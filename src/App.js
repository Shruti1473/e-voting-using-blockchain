import React, { useEffect, useState } from "react";
import Web3 from "web3";
import contractData from "./abi/Voting.json";
const contractABI = contractData.abi; // Extract the ABI array


const CONTRACT_ADDRESS = "0xb4a2a8101EA188bc6fD4896Aa9e68716d77d2a02"; // Update this!

function App() {
  const [account, setAccount] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);

          const contractInstance = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
          
          fetchCandidates(contractInstance);
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      } else {
        alert("MetaMask not detected! Please install it.");
      }
    }
    init();
  }, []);

  async function fetchCandidates(contractInstance) {
    try {
      const totalCandidates = await contractInstance.methods.candidatesCount().call();
      console.log("Total Candidates:", totalCandidates);

      let candidatesList = [];
      for (let i = 1; i <= totalCandidates; i++) {
        const candidate = await contractInstance.methods.getCandidate(i).call();
        console.log("Candidate:", candidate);

        candidatesList.push({
          id: candidate[0], 
          name: candidate[1], 
          voteCount: candidate[2]
        });
      }

      setCandidates(candidatesList);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  }

  async function vote(candidateId) {
    if (!contract || !account) {
      alert("Connect MetaMask first!");
      return;
    }

    try {
      await contract.methods.vote(candidateId).send({ from: account });
      fetchCandidates(contract);
    } catch (error) {
      console.error("Error voting:", error);
    }
  }

  return (
    <div>
      <h1>E-Voting System</h1>
      <h3>Connected Account: {account || "Not connected"}</h3>

      {candidates.length > 0 ? (
        candidates.map((candidate) => (
          <div key={candidate.id}>
            <p>{candidate.name} - {candidate.voteCount} votes</p>
            <button onClick={() => vote(candidate.id)}>Vote</button>
          </div>
        ))
      ) : (
        <p>Loading candidates...</p>
      )}
    </div>
  );
}

export default App;
