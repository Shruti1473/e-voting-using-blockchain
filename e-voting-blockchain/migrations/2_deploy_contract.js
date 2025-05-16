const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  const candidateNames = ["Narendra Modi", "Rahul Gandhi", "Mamta Banerjee"];
  deployer.deploy(Voting, candidateNames);
};
