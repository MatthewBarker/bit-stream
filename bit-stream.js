/* eslint no-bitwise: ["error", { "allow": [">>>"] }] */

const stream = require('stream');

const BUFFER_SIZE = 1024;

/**
 * Write individual bits to a node stream.
 * (Incomplete bytes are not written)
 *
 * @extends stream.Writable
 */
export default class BitStream extends stream.Writable {
    /**
     * Constructs a new instance of the BitStream class.
     *
     * @example
     * const BitStream = require('bit-stream');
     * const bitStream = new BitStream();
     */
    constructor() {
        super();

        this.bits = '';
        this.buffer = Buffer.alloc(BUFFER_SIZE);
        this.offset = 0;
        this.readable = true;
        this.writable = false;
    }

    /**
     * Align to a byte boundary.
     *
     * @example
     * bitStream.writeStringBits('0011');
     * bitstream.align(); // 00110000
     */
    align() {
        if (this.bits) {
            const padding = '0'.repeat(8 - this.bits.length);

            this.writeStringBits(padding);
            this.bits = '';
        }
    }

    /**
     * Align to a byte boundary, flush the data and emit the finish event.
     */
    end() {
        this.align();
        this.flush();
        this.emit('finish');
        delete this.buffer;
    }

    /**
     * Emit all whole bytes written so far and re-allocate the buffer.
     */
    flush() {
        this.emit('data', this.buffer.slice(0, this.offset));
        this.buffer = Buffer.alloc(BUFFER_SIZE);
        this.offset = 0;
    }

    /**
     * Write a number array of bit values.
     *
     * @param {number} value - Value to write
     * @example
     * bitStream.writeArrayBits([0, 0, 0, 1, 1, 0, 0, 0]); // 00011000
     */
    writeArrayBits(value) {
        this.writeStringBits(value.join(''));
    }

    /**
     * Write an integer value as the specified number of bits.
     *
     * @param {number} value - Value to write
     * @param {number} [bitLength = 32] - Length to write in bits
     * @throws {RangeError} Minimum bitLength is 0.
     * @throws {RangeError} Maximum bitLength is 32.
     * @example
     * bitStream.writeInt32Bits(3, 8); // 00000011
     * bitStream.writeInt32Bits(-3); // 11111111111111111111111111111101
     */
    writeIntBits(value, bitLength = 32) {
        if (bitLength < 0) {
            throw new RangeError('Minimum bitLength is 0');
        }

        if (bitLength > 32) {
            throw new RangeError('Maximum bitLength is 32');
        }

        let binary = (value >>> 0).toString(2);

        binary = (value < 0 ? '1' : '0').repeat(32 - binary.length) + binary;
        this.writeStringBits(binary.substr(-bitLength));
    }

    /**
     * Write a string of bit values.
     *
     * @param {number} value - Value to write
     * @throws {Error} Invalid format: value must be composed of 1s and 0s.
     * @example
     * bitStream.writeStringBits('0011');
     * bitStream.writeStringBits('0011'); // 00110011
     */
    writeStringBits(value) {
        if (/[^0-1]/.test(value)) {
            throw new Error(`Invalid format: ${value}`);
        }

        const bytes = (this.bits + value).match(/.{1,8}/g);
        const complete = bytes.filter(byte => byte.length === 8);
        const leftover = bytes.filter(byte => byte.length !== 8);

        for (const byte of complete) {
            const uint8 = parseInt(byte, 2);

            if (this.offset === BUFFER_SIZE) {
                this.flush();
            }

            this.buffer.writeUInt8(uint8, this.offset);
            this.offset += 1;
        }

        this.bits = leftover.length ? leftover[0] : '';
    }

    /**
     * Call before each byte aligned number is written.
     *
     * @param {number} byteLength - Length in bytes
     * @throws {RangeError} Exceeded buffer size: 1024.
     * @private
     */
    beforeWriteAligned(byteLength) {
        if (byteLength > BUFFER_SIZE) {
            throw new RangeError(`Exceeded buffer size: ${BUFFER_SIZE}`);
        }

        this.align();

        if (this.offset + byteLength >= BUFFER_SIZE) {
            this.flush();
        }
    }

    /**
     * Write an aligned string.
     *
     * @param {string} value - Value to write
     * @param {string} [encoding = 'utf8'] - Character encoding
     */
    write(value, encoding = 'utf8') {
        const byteLength = Buffer.byteLength(value, encoding);

        this.beforeWriteAligned(byteLength);
        this.offset += this.buffer.write(value, this.offset, byteLength, encoding);
    }

    /**
     * Write an aligned DoubleBE.
     *
     * @param {number} value - Value to write
     */
    writeDoubleBE(value) {
        this.beforeWriteAligned(8);
        this.offset = this.buffer.writeDoubleBE(value, this.offset);
    }

    /**
     * Write an aligned DoubleLE.
     *
     * @param {number} value - Value to write
     */
    writeDoubleLE(value) {
        this.beforeWriteAligned(8);
        this.offset = this.buffer.writeDoubleLE(value, this.offset);
    }

    /**
     * Write an aligned FloatBE.
     *
     * @param {number} value - Value to write
     */
    writeFloatBE(value) {
        this.beforeWriteAligned(4);
        this.offset = this.buffer.writeFloatBE(value, this.offset);
    }

    /**
     * Write an aligned FloatLE.
     *
     * @param {number} value - Value to write
     */
    writeFloatLE(value) {
        this.beforeWriteAligned(4);
        this.offset = this.buffer.writeFloatLE(value, this.offset);
    }

    /**
     * Write an aligned Int8.
     *
     * @param {number} value - Value to write
     */
    writeInt8(value) {
        this.beforeWriteAligned(1);
        this.offset = this.buffer.writeInt8(value, this.offset);
    }

    /**
     * Write an aligned Int16BE.
     *
     * @param {number} value - Value to write
     */
    writeInt16BE(value) {
        this.beforeWriteAligned(2);
        this.offset = this.buffer.writeInt16BE(value, this.offset);
    }

    /**
     * Write an aligned Int16LE.
     *
     * @param {number} value - Value to write
     */
    writeInt16LE(value) {
        this.beforeWriteAligned(2);
        this.offset = this.buffer.writeInt16LE(value, this.offset);
    }

    /**
     * Write an aligned Int32BE.
     *
     * @param {number} value - Value to write
     */
    writeInt32BE(value) {
        this.beforeWriteAligned(4);
        this.offset = this.buffer.writeInt32BE(value, this.offset);
    }

    /**
     * Write an aligned Int32LE.
     *
     * @param {number} value - Value to write
     */
    writeInt32LE(value) {
        this.beforeWriteAligned(4);
        this.offset = this.buffer.writeInt32LE(value, this.offset);
    }

    /**
     * Write an aligned IntBE.
     *
     * @param {number} value - Value to write
     * @param {number} byteLength - Length in bytes
     */
    writeIntBE(value, byteLength) {
        this.beforeWriteAligned(byteLength);
        this.offset = this.buffer.writeIntBE(value, this.offset, byteLength);
    }

    /**
     * Write an aligned IntLE.
     *
     * @param {number} value - Value to write
     * @param {number} byteLength - Length in bytes
     */
    writeIntLE(value, byteLength) {
        this.beforeWriteAligned(byteLength);
        this.offset = this.buffer.writeIntLE(value, this.offset, byteLength);
    }

    /**
     * Write an aligned UInt8.
     *
     * @param {number} value - Value to write
     */
    writeUInt8(value) {
        this.beforeWriteAligned(1);
        this.offset = this.buffer.writeUInt8(value, this.offset);
    }

    /**
     * Write an aligned UInt16BE.
     *
     * @param {number} value - Value to write
     */
    writeUInt16BE(value) {
        this.beforeWriteAligned(2);
        this.offset = this.buffer.writeUInt16BE(value, this.offset);
    }

    /**
     * Write an aligned UInt16LE.
     *
     * @param {number} value - Value to write
     */
    writeUInt16LE(value) {
        this.beforeWriteAligned(2);
        this.offset = this.buffer.writeUInt16LE(value, this.offset);
    }

    /**
     * Write an aligned UInt32BE.
     *
     * @param {number} value - Value to write
     */
    writeUInt32BE(value) {
        this.beforeWriteAligned(4);
        this.offset = this.buffer.writeUInt32BE(value, this.offset);
    }

    /**
     * Write an aligned UInt32LE.
     *
     * @param {number} value - Value to write
     */
    writeUInt32LE(value) {
        this.beforeWriteAligned(4);
        this.offset = this.buffer.writeUInt32LE(value, this.offset);
    }

    /**
     * Write an aligned UIntBE.
     *
     * @param {number} value - Value to write
     * @param {number} byteLength - Length in bytes
     */
    writeUIntBE(value, byteLength) {
        this.beforeWriteAligned(byteLength);
        this.offset = this.buffer.writeUIntBE(value, this.offset, byteLength);
    }

    /**
     * Write an aligned UIntLE.
     *
     * @param {number} value - Value to write
     * @param {number} byteLength - Length in bytes
     */
    writeUIntLE(value, byteLength) {
        this.beforeWriteAligned(byteLength);
        this.offset = this.buffer.writeUIntLE(value, this.offset, byteLength);
    }
}
