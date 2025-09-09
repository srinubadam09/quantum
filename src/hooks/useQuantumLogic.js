import { useState, useCallback } from 'react';
import * as math from 'mathjs';

// Utility functions
const ZERO_C = math.complex(0, 0);
const c = (re, im = 0) => math.complex(re, im);

// Gate matrices
const SQRT1_2 = 1 / Math.sqrt(2);
const GATES = {
  X: [[c(0, 0), c(1, 0)], [c(1, 0), c(0, 0)]],
  Y: [[c(0, 0), c(0, -1)], [c(0, 1), c(0, 0)]],
  Z: [[c(1, 0), c(0, 0)], [c(0, 0), c(-1, 0)]],
  H: [[c(SQRT1_2, 0), c(SQRT1_2, 0)], [c(SQRT1_2, 0), c(-SQRT1_2, 0)]],
  S: [[c(1, 0), c(0, 0)], [c(0, 0), c(0, 1)]],
  Sdg: [[c(1, 0), c(0, 0)], [c(0, 0), c(0, -1)]],
  T: [[c(1, 0), c(0, 0)], [c(0, 0), math.exp(math.multiply(c(0, 1), Math.PI / 4))]],
  Tdg: [[c(1, 0), c(0, 0)], [c(0, 0), math.exp(math.multiply(c(0, -1), Math.PI / 4))]],
};

// Parameterized gates
const Rx = (theta) => {
  const th = theta / 2;
  return [
    [c(Math.cos(th), 0), c(0, -Math.sin(th))],
    [c(0, -Math.sin(th)), c(Math.cos(th), 0)]
  ];
};

const Ry = (theta) => {
  const th = theta / 2;
  return [
    [c(Math.cos(th), 0), c(-Math.sin(th), 0)],
    [c(Math.sin(th), 0), c(Math.cos(th), 0)]
  ];
};

const Rz = (theta) => {
  const th = theta / 2;
  return [
    [math.exp(math.multiply(c(0, -1), th)), c(0, 0)],
    [c(0, 0), math.exp(math.multiply(c(0, 1), th))]
  ];
};

const Phase = (phi) => {
  return [[c(1, 0), c(0, 0)], [c(0, 0), math.exp(math.multiply(c(0, 1), phi))]];
};

export const useQuantumLogic = () => {
  const [stateVec, setStateVec] = useState([]);
  const [gateSequence, setGateSequence] = useState([]);

  const initState = useCallback((n, basisState = '0') => {
    const dim = 1 << n;
    const newStateVec = Array(dim).fill(0).map(() => c(0, 0));
    const initIndex = parseInt(basisState, 2);
    newStateVec[initIndex] = c(1, 0);
    setStateVec(newStateVec);
  }, []);

  const applySingleQubitGate = useCallback((psi, n, target, U) => {
    const dim = psi.length;
    const out = Array(dim).fill(0).map(() => c(0, 0));
    for (let i = 0; i < dim; i++) {
      const bin = i.toString(2).padStart(n, '0');
      const bit = parseInt(bin[target]);
      for (let j = 0; j < 2; j++) {
        const newBin = bin.substring(0, target) + j.toString() + bin.substring(target + 1);
        const idx = parseInt(newBin, 2);
        const coeff = U[j][bit];
        out[idx] = math.add(out[idx], math.multiply(coeff, psi[i]));
      }
    }
    return out;
  }, []);

  const applyCNOT = useCallback((psi, n, control, target) => {
    const dim = psi.length;
    const out = Array(dim).fill(0).map(() => c(0, 0));
    for (let i = 0; i < dim; i++) {
      const bin = i.toString(2).padStart(n, '0');
      if (bin[control] === '1') {
        const flippedBit = bin[target] === '1' ? '0' : '1';
        const newBin = bin.substring(0, target) + flippedBit + bin.substring(target + 1);
        const idx = parseInt(newBin, 2);
        out[idx] = math.add(out[idx], psi[i]);
      } else {
        out[i] = math.add(out[i], psi[i]);
      }
    }
    return out;
  }, []);

  const applyCZ = useCallback((psi, n, control, target) => {
    const dim = psi.length;
    const out = Array(dim).fill(0).map(() => c(0, 0));
    for (let i = 0; i < dim; i++) {
      const bin = i.toString(2).padStart(n, '0');
      const phase = (bin[control] === '1' && bin[target] === '1') ? c(-1, 0) : c(1, 0);
      out[i] = math.add(out[i], math.multiply(phase, psi[i]));
    }
    return out;
  }, []);

  const applySWAP = useCallback((psi, n, a, b) => {
    if (a === b) return psi.slice();
    const dim = psi.length;
    const out = Array(dim).fill(0).map(() => c(0, 0));
    for (let i = 0; i < dim; i++) {
      const bin = i.toString(2).padStart(n, '0');
      if (bin[a] === bin[b]) {
        out[i] = math.add(out[i], psi[i]);
      } else {
        const swapped = bin.substring(0, Math.min(a, b))
          + (a < b ? bin[b] : bin[a])
          + bin.substring(Math.min(a, b) + 1, Math.max(a, b))
          + (a < b ? bin[a] : bin[b])
          + bin.substring(Math.max(a, b) + 1);
        const idx = parseInt(swapped, 2);
        out[idx] = math.add(out[idx], psi[i]);
      }
    }
    return out;
  }, []);

  const applyCCNOT = useCallback((psi, n, c1, c2, t) => {
    const dim = psi.length;
    const out = Array(dim).fill(0).map(() => c(0, 0));
    for (let i = 0; i < dim; i++) {
      const bin = i.toString(2).padStart(n, '0');
      if (bin[c1] === '1' && bin[c2] === '1') {
        const flippedBit = bin[t] === '1' ? '0' : '1';
        const newBin = bin.substring(0, t) + flippedBit + bin.substring(t + 1);
        const idx = parseInt(newBin, 2);
        out[idx] = math.add(out[idx], psi[i]);
      } else {
        out[i] = math.add(out[i], psi[i]);
      }
    }
    return out;
  }, []);

  const measureQubit = useCallback((psi, n, target) => {
    const dim = psi.length;
    let p0 = 0;

    for (let i = 0; i < dim; i++) {
      const bin = i.toString(2).padStart(n, '0');
      if (bin[target] === '0') {
        p0 += math.abs(psi[i]) ** 2;
      }
    }

    const r = Math.random();
    const outcome = (r < p0) ? 0 : 1;

    const newPsi = psi.map((amp, i) => {
      const bin = i.toString(2).padStart(n, '0');
      return (parseInt(bin[target]) === outcome) ? amp : c(0, 0);
    });

    const norm = Math.sqrt(newPsi.reduce((sum, amp) => sum + math.abs(amp) ** 2, 0));
    for (let i = 0; i < dim; i++) {
      newPsi[i] = math.divide(newPsi[i], norm);
    }

    return { outcome, newPsi };
  }, []);

  const outerProduct = useCallback((psi) => {
    const dim = psi.length;
    const rho = Array(dim).fill(0).map(() => Array(dim).fill(0).map(() => c(0, 0)));
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        rho[i][j] = math.multiply(psi[i], math.conj(psi[j]));
      }
    }
    return rho;
  }, []);

  const partialTrace = useCallback((rho, n, target) => {
    const dim = rho.length;
    let red = [[c(0, 0), c(0, 0)], [c(0, 0), c(0, 0)]];
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const ib = i.toString(2).padStart(n, '0');
        const jb = j.toString(2).padStart(n, '0');
        let equalOther = true;
        for (let k = 0; k < n; k++) {
          if (k !== target && ib[k] !== jb[k]) {
            equalOther = false;
            break;
          }
        }
        if (equalOther) {
          const a = parseInt(ib[target]);
          const b = parseInt(jb[target]);
          red[a][b] = math.add(red[a][b], rho[i][j]);
        }
      }
    }
    const trace = math.add(red[0][0], red[1][1]);
    return [
      [math.divide(red[0][0], trace), math.divide(red[0][1], trace)],
      [math.divide(red[1][0], trace), math.divide(red[1][1], trace)]
    ];
  }, []);

  const runSimulation = useCallback((nQ, initialBasisState, gates) => {
    initState(nQ, initialBasisState);
    let psi = [];
    const dim = 1 << nQ;
    psi = Array(dim).fill(0).map(() => c(0, 0));
    const initIndex = parseInt(initialBasisState, 2);
    psi[initIndex] = c(1, 0);

    let measurementResults = [];

    for (const g of gates) {
      if (g.type in GATES) {
        psi = applySingleQubitGate(psi, nQ, g.params[0], GATES[g.type]);
      } else if (g.type === 'MEASURE') {
        const target = g.params[0];
        const { outcome, newPsi } = measureQubit(psi, nQ, target);
        psi = newPsi;
        measurementResults.push(`Measurement outcome for qubit ${target}: ${outcome}`);
      } else if (g.type === 'Rx') {
        psi = applySingleQubitGate(psi, nQ, g.params[0], Rx(g.angle));
      } else if (g.type === 'Ry') {
        psi = applySingleQubitGate(psi, nQ, g.params[0], Ry(g.angle));
      } else if (g.type === 'Rz') {
        psi = applySingleQubitGate(psi, nQ, g.params[0], Rz(g.angle));
      } else if (g.type === 'Phase') {
        psi = applySingleQubitGate(psi, nQ, g.params[0], Phase(g.angle));
      } else if (g.type === 'CNOT') {
        psi = applyCNOT(psi, nQ, g.params[0], g.params[1]);
      } else if (g.type === 'CZ') {
        psi = applyCZ(psi, nQ, g.params[0], g.params[1]);
      } else if (g.type === 'SWAP') {
        psi = applySWAP(psi, nQ, g.params[0], g.params[1]);
      } else if (g.type === 'CCNOT') {
        psi = applyCCNOT(psi, nQ, g.params[0], g.params[1], g.params[2]);
      }
    }

    setStateVec(psi);

    const rho = outerProduct(psi);
    const reducedList = [];
    for (let q = 0; q < nQ; q++) {
      const red = partialTrace(rho, nQ, q);
      reducedList.push(red);
    }

    return { stateVec: psi, rho, reducedList, measurementResults };
  }, [initState, applySingleQubitGate, applyCNOT, applyCZ, applySWAP, applyCCNOT, measureQubit, outerProduct, partialTrace]);

  return {
    stateVec,
    gateSequence,
    setGateSequence,
    runSimulation,
    initState
  };
};