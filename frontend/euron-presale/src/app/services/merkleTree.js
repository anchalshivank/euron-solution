import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { ethers } from "ethers";
import { toBigNum } from './web3.service';


const solidityHash = (address, amount) => {
  const hash = ethers.utils.solidityKeccak256(
    ["address", "uint256"],
    [address, toBigNum(amount)]
  );

  return hash;
}
export function generateMerkleTree(data) {
  const leaves = data.map(item => solidityHash(item.__id__, parseFloat(item.cp)));
  const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return merkleTree;
}

export function getMerkleRoot(merkleTree) {
  return merkleTree.getRoot().toString('hex');
}

export function getProof(merkleTree, address, amount) {
  const leaf = solidityHash(address, parseFloat(amount));
  return merkleTree.getHexProof(leaf);
}

