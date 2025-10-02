const crypto = require('crypto');

export default function wpHashPassword(
    password: string,
    hash: string
): { hash: string; valid: boolean } {
    const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    // Extract the iteration count and salt from the hash
    const id = hash.substring(0, 3);
    if (id !== '$P$' && id !== '$H$') return { hash: '', valid: false };

    const countLog2 = itoa64.indexOf(hash[3]);
    const count = 1 << countLog2;
    const salt = hash.substring(4, 12);

    // Convert password to UTF-8 buffer
    const passwordBuffer = Buffer.from(password, 'utf8');

    // Generate hash using the same algorithm as WordPress PHPass
    // Initial hash: md5(salt + password)
    let newHash = crypto.createHash('md5').update(salt, 'utf8').update(passwordBuffer).digest();

    // Iterate count times: md5(hash + password)
    for (let i = 0; i < count; i++) {
        newHash = crypto.createHash('md5').update(newHash).update(passwordBuffer).digest();
    }

    // Encode the result using WordPress's base64-like encoding
    let output = id + hash[3] + salt;
    output += encode64(newHash, 16, itoa64);

    return { hash: output, valid: output === hash };
}

function encode64(input: Buffer, count: number, itoa64: string): string {
    let output = '';
    let i = 0;

    do {
        const value = input[i++];
        output += itoa64[value & 0x3f];

        if (i < count) {
            const value2 = input[i];
            output += itoa64[((value >> 6) & 0x03) | ((value2 & 0x0f) << 2)];

            if (i++ >= count) break;

            if (i < count) {
                const value3 = input[i];
                output += itoa64[((value2 >> 4) & 0x0f) | ((value3 & 0x03) << 4)];

                if (i++ >= count) break;

                output += itoa64[(value3 >> 2) & 0x3f];
            }
        } else {
            output += itoa64[(value >> 6) & 0x03];
        }
    } while (i < count);

    return output;
}
