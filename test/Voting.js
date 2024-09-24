const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Voting", function () {
  const candidates = [
    ethers.encodeBytes32String('John Doe'),
    ethers.encodeBytes32String('Martin Luther'),
    ethers.encodeBytes32String('Lucia Morini'),
  ];
  const TWO_DAYS = 2 * 24 * 60 * 60;
  

  async function deployVotingContract() {
    const [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();

    const timeLimit = (await time.latest()) + TWO_DAYS;

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidates, timeLimit);

    return { voting, owner, voter1, voter2, voter3, voter4 };
  }

  async function deployVotingContractWithOneCandidate() {
    const [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();

    const timeLimit = (await time.latest()) + TWO_DAYS;

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy([candidates[0]], timeLimit);

    return { voting, owner, voter1, voter2, voter3, voter4 };
  }

  async function deployVotingContractWithTimestampInThePast() {
    const [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();

    const timeLimit = (await time.latest()) - TWO_DAYS;

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidates, timeLimit);

    return { voting, owner, voter1, voter2, voter3, voter4 };
  }

  describe('Deployment is fine', function() {
    it('Should deploy a Voting contract with 3 candidates', async function() {

      await loadFixture(deployVotingContract);
    })

    it('Should not deploy a single list candidate', async function() {
      await expect(loadFixture(deployVotingContractWithOneCandidate)).to.be.revertedWith(
        "Must have at least 2 candidates"
      );
    })

    it('Should not deploy if the timeLimit is in the past', async function() {
      await expect(loadFixture(deployVotingContractWithTimestampInThePast)).to.be.revertedWith(
        "Time limit should be in the future"
      );
    })
  });

  describe('Voting sessions', function() {
    it('User should be able to vote with their wanted candidates', async function() {
      const { voting, voter1, voter2, voter3, voter4 } = await loadFixture(deployVotingContract);

      const asVoter1 = await voting.connect(voter1);
      await asVoter1.vote(0);

      const asVoter2 = await voting.connect(voter2);
      await asVoter2.vote(1);

      const asVoter3 = await voting.connect(voter3);
      await asVoter3.vote(2);

      const asVoter4 = await voting.connect(voter4);
      await asVoter4.vote(0);
    })

    it('User should not be able to vote for an invalid index', async function() {
      const { voting, voter1, } = await loadFixture(deployVotingContract);

      const asVoter1 = await voting.connect(voter1);
      await await expect(asVoter1.vote(candidates.length)).to.be.revertedWith(
        "Invalid candidate index!"
      );

      await expect(asVoter1.vote(100)).to.be.revertedWith(
        "Invalid candidate index!"
      );
    })

    it('User should not be able to vote twice', async function() {
      const { voting, voter1, voter2, voter3, voter4 } = await loadFixture(deployVotingContract);

      const asVoter1 = await voting.connect(voter1);
      await asVoter1.vote(0);

      const asVoter2 = await voting.connect(voter2);
      await asVoter2.vote(1);

      await expect(asVoter2.vote(2)).to.be.revertedWith(
        'Voter already casted the vote!'
      );
    })

    it('User should not be able to vote if timeLimit expired', async function() {
      const { voting, voter1, voter2, voter3, voter4 } = await loadFixture(deployVotingContract);

      const asVoter1 = await voting.connect(voter1);
      await asVoter1.vote(0);

      const asVoter2 = await voting.connect(voter2);
      await asVoter2.vote(1);

      const asVoter3 = await voting.connect(voter3);

      await time.increaseTo(await time.latest() + TWO_DAYS);

      await expect(asVoter3.vote(2)).to.be.revertedWith(
        'Voting session has ended!'
      );
    })

    it('Should correctly return the winner of the voting session', async function() {
      const { voting, voter1, voter2, voter3, voter4 } = await loadFixture(deployVotingContract);

      const asVoter1 = await voting.connect(voter1);
      await asVoter1.vote(0);

      const asVoter2 = await voting.connect(voter2);
      await asVoter2.vote(1);

      const asVoter3 = await voting.connect(voter3);
      await asVoter3.vote(2);

      const asVoter4 = await voting.connect(voter4);
      await asVoter4.vote(0);

      await time.increaseTo(await time.latest() + TWO_DAYS);

      const winnerName = await voting.winner();

      await expect(winnerName).to.be.eq(candidates[0])
    })

    it('Checking winner should revert if voting sessions has not ended', async function() {
      const { voting, voter1, voter2, voter3, voter4 } = await loadFixture(deployVotingContract);

      const asVoter1 = await voting.connect(voter1);
      await asVoter1.vote(0);

      const asVoter2 = await voting.connect(voter2);
      await asVoter2.vote(1);

      const asVoter3 = await voting.connect(voter3);
      await asVoter3.vote(2);

      const asVoter4 = await voting.connect(voter4);
      await asVoter4.vote(0);

      await expect(voting.winner()).to.be.revertedWith(
        'Voting session is not ended!'
      );
    })
  });
});