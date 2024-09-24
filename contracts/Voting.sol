// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
  struct Candidate {
    bytes32 name;
    uint votes;
  }

  address[] voters;
  Candidate[] candidates;
  uint public timeLimit;

  function didVote(address voter) private view returns (bool) {
    for (uint i = 0; i < voters.length; i++) {
      if (voter == voters[i]) {
        return true;
      }
    }

    return false;
  }

  constructor(bytes32[] memory candidateNames, uint _timeLimit) {
    require(candidateNames.length > 1, 'Must have at least 2 candidates');
    require(_timeLimit > block.timestamp, 'Time limit should be in the future');
    timeLimit = _timeLimit;

    for (uint i = 0; i < candidateNames.length; i++) {
      candidates.push(Candidate({
        name: candidateNames[i],
        votes: 0
      }));
    }
  }

  // 1. Vote function - should validate if the user address has not already voted and if timeLimit has not expired
  // 2. View votes/winners - accessible only after the timelimit has expired

  function vote(uint candidateIndex) public {
    address voter = msg.sender;

    require(candidateIndex < candidates.length, 'Invalid candidate index!');
    require(didVote(voter) == false, 'Voter already casted the vote!');
    require(block.timestamp <= timeLimit, 'Voting session has ended!');

    Candidate storage candidate = candidates[candidateIndex];
    candidate.votes += 1;

    voters.push(voter);
  }

  function winner() public view returns (bytes32) {
    require(block.timestamp > timeLimit, 'Voting session is not ended!');

    Candidate storage candidate = candidates[0];

    // TOCHECK Candidates with same number of votes
    for (uint i = 1; i < candidates.length; i++) {
      if (candidates[i].votes > candidate.votes) {
        candidate = candidates[i];
      }
    }

    return candidate.name;
  }
}