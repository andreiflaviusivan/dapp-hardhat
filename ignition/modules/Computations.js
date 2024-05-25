const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ComputationsModule", (m) => {

  const computations = m.contract("Computations",);

  return { computations };
});
