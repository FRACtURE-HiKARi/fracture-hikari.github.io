import { simpleStringHash } from "./hashing.js";

function formatDateToYYMMDD(date) {
  const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, add 1, pad with '0'
  const day = date.getDate().toString().padStart(2, '0'); // Pad with '0'
  return `${year}-${month}-${day}`;
}

function createSimpleDateBasedPRNG(seed) {
  // LCG parameters (common choice for 32-bit PRNGs)
  // These specific values are chosen to create a full period and reasonable properties.
  const a = 1664525;
  const c = 1013904223;
  const m = 2**32; // Modulus (2^32 for 32-bit unsigned integers)
  // Initialize the state. Using `>>> 0` ensures it's treated as a 32-bit unsigned integer.
  let state = seed >>> 0;
  // Ensure state is not zero, as an LCG with state 0 will always generate 0.
  if (state === 0) {
      state = 1; // Or any other non-zero value.
  }
  // The function that generates the next number
  return function() {
    state = (a * state + c) % m;
    // Normalize to [0, 1) by dividing by the modulus (m)
    return state / m;
  };
}

var source = `${formatDateToYYMMDD(new Date())}-${navigator.userAgent}`;
var jrrp = createSimpleDateBasedPRNG(simpleStringHash(source));
var JRRP = jrrp();
export {JRRP};
