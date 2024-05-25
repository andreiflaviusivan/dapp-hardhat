const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

  describe("Computations", function () {
    async function deployComputations() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();

      const Computations = await ethers.getContractFactory("Computations");
      const computations = await Computations.deploy();

      return { computations, owner, otherAccount };
    }

    describe("Sums", function () {
      it("should return the sum of 2 numbers", async function () {
        const { computations } = await loadFixture(deployComputations);

        const sum1 = await computations.sum(1, 2);
        const sum2 = await computations.sum(-1, 2);
  
        expect(sum1).to.equal(3);
        expect(sum2).to.equal(1);
      });

      it("should return the sum of 2 negative numbers", async function () {
        const { computations } = await loadFixture(deployComputations);

        const sum = await computations.sum(-1, -2);
  
        expect(sum).to.equal(-3);
      });
    });
  });