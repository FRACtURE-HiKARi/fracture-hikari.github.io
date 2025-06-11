/**
 * A basic, deterministic pseudo-word-embedding generator for demonstration purposes.
 * In a real application, you'd use pre-trained embeddings (e.g., Word2Vec, GloVe, FastText).
 * This function generates a fixed-size vector for each word based on its characters.
 * It's highly simplified and not semantically rich.
 *
 * @param {string} word The word to embed.
 * @param {number} vectorSize The desired size of the embedding vector.
 * @returns {number[]} The embedding vector.
 */
function getPseudoWordEmbedding(word, vectorSize = 128) {
    const seed = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const vector = new Array(vectorSize).fill(0);

    // A simple, deterministic way to fill the vector based on the seed
    for (let i = 0; i < vectorSize; i++) {
        // Use a simple LCG-like PRNG for determinism
        const a = 1103515245;
        const c = 12345;
        const m = Math.pow(2, 31); // A large prime-like number
        let currentSeed = (seed * a + c + i) % m; // Incorporate index to vary values

        // Map to a range (e.g., -1 to 1)
        vector[i] = (currentSeed / m) * 2 - 1;
    }
    return vector;
}

/**
 * Calculates a simple non-cryptographic hash for a string, adapted for
 * floating point numbers (inspired by MurmurHash3 principles).
 * This helps in creating a 'hash-like' value from the sentence embedding.
 *
 * @param {string} str The string to hash.
 * @returns {number} A 32-bit integer hash value.
 */
function simpleStringHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i);
        h |= 0; // Ensure 32-bit integer
    }
    return h;
}

/**
 * Implements a locality-sensitive hash-like function for sentences
 * that outputs a real value in [0, 1).
 *
 * Properties:
 * 1. Output is in [0, 1) and aims for even distribution.
 * 2. Hash-like: Deterministic for the same input.
 * 3. Locality-sensitive: Small changes in sentence -> small changes in hash.
 *    Large changes in sentence -> significant changes in hash.
 *
 * @param {string} sentence The input sentence.
 * @returns {number} A real value in [0, 1).
 */
function getSentenceHashValue(sentence) {
    if (!sentence || typeof sentence !== 'string' || sentence.trim() === '') {
        // Handle empty or invalid input gracefully
        // For uniformity, we might return a consistent value or throw an error.
        // Returning 0 for empty string is deterministic.
        return 0.0;
    }

    const words = [... sentence];
    if (words.length === 0) {
        return 0.0; // No words found
    }

    const embeddingSize = 64; // Size of our pseudo-embeddings
    let sentenceVector = new Array(embeddingSize).fill(0);

    // Sum/Average word embeddings to get a sentence embedding
    for (const word of words) {
        const wordEmbedding = getPseudoWordEmbedding(word, embeddingSize);
        for (let i = 0; i < embeddingSize; i++) {
            sentenceVector[i] += wordEmbedding[i];
        }
    }

    // Normalize the sentence vector (optional, but can help consistency)
    const magnitude = Math.sqrt(sentenceVector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
        sentenceVector = sentenceVector.map(val => val / magnitude);
    }

    // --- Convert the sentence vector to a single float hash-like value ---
    // We'll treat the vector as a sequence of numbers and apply a pseudo-hash logic.
    // This part is crucial for distributing the values and making it "hash-like".

    let combinedHash = 0;
    const prime1 = 0xcc9e2d51; // MurmurHash3 C1 equivalent for 32-bit
    const prime2 = 0x1b873593; // MurmurHash3 C2 equivalent for 32-bit
    const r1 = 15; // MurmurHash3 R1 equivalent
    const r2 = 13; // MurmurHash3 R2 equivalent
    const m = 5;  // MurmurHash3 M equivalent
    const n = 0xe6546b64; // MurmurHash3 FNL equivalent

    // Initialize with a seed (e.g., a hash of the sentence itself)
    // This helps in distinguishing similar inputs that might otherwise produce
    // very close vectors due to averaging.
    let h1 = simpleStringHash(sentence) >>> 0; // Use unsigned 32-bit

    for (let i = 0; i < sentenceVector.length; i++) {
        // Treat each float component as a 32-bit integer (approximated)
        // by multiplying by a large number and taking integer part.
        let k1 = Math.imul(Math.floor(sentenceVector[i] * 0x7FFFFFFF), prime1) >>> 0; // Ensure unsigned 32-bit

        k1 = (k1 << r1) | (k1 >>> (32 - r1)); // ROTL32
        k1 = Math.imul(k1, prime2) >>> 0;

        h1 ^= k1;
        h1 = (h1 << r2) | (h1 >>> (32 - r2)); // ROTL32
        h1 = Math.imul(h1, m) >>> 0;
        h1 = (Math.imul(h1, 2) + n) >>> 0; // Adjusted add to maintain similar Murmur3 behavior
    }

    // Finalization mix (MurmurHash3-like)
    h1 ^= h1 >>> 16;
    h1 = Math.imul(h1, 0x85ebca6b) >>> 0;
    h1 ^= h1 >>> 13;
    h1 = Math.imul(h1, 0xc2b2ae35) >>> 0;
    h1 ^= h1 >>> 16;

    // Map the 32-bit unsigned integer hash to [0, 1)
    return (h1 >>> 0) / 0xFFFFFFFF; // Divide by max unsigned 32-bit integer
}

export {simpleStringHash, getSentenceHashValue};
