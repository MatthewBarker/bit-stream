# Bit Stream

Write individual bits to a node stream:

- extends [stream.Writable](https://nodejs.org/api/stream.html#stream_class_stream_writable)
- wraps [stream.Buffer](https://nodejs.org/api/buffer.html)

**N.B. The version of Node written for and testing against is 6.1.0**

## Methods

### Updating the Stream
The following methods operate on the stream:

- align - Align to a byte boundary
- end - Align to a byte boundary, flush the data and emit the finish event
- flush - Emit all whole bytes written so far and re-allocate the buffer

### Writing Bits
The following methods support writing of individual bits:

- writeArrayBits - Write a number array of bit values
- writeIntBits - Write an integer value as the specified number of bits
- writeStringBits - Write a string of bit values

**N.B. The underlying buffer is set to 1024 bytes. Exceeding this length will throw an error.**

### Writing Bytes
The following methods operate on the wrapped buffer by byte-aligning any data written so far 
then calling the corresponding method on the buffer:

- write
- writeDoubleBE
- writeDoubleLE
- writeFloatBE
- writeFloatLE
- writeInt8
- writeInt16BE
- writeInt16LE
- writeInt32BE
- writeInt32LE
- writeIntBE
- writeIntLE
- writeUInt8
- writeUInt16BE
- writeUInt16LE
- writeUInt32BE
- writeUInt32LE
- writeUIntBE
- writeUIntLE

(see the [stream.Buffer](https://nodejs.org/api/buffer.html) documentation for usage details)

## Usage Examples

### constructor

```javascript
const BitStream = require('bit-stream');
const bitStream = new BitStream();
```

### align()

```javascript
bitStream.writeStringBits('0011');
bitStream.align(); // 00110000
```

### writeArrayBits(value)

```javascript
bitStream.writeArrayBits([0, 0, 0, 1, 1, 0, 0, 0]); // 00011000
```

### writeInt32Bits(value, [bitLength = 32])

```javascript
bitStream.writeInt32Bits(3, 8); // 00000011
```

```javascript
bitStream.writeInt32Bits(-3); // 11111111111111111111111111111101
```

### writeStringBits(value)

```javascript
bitStream.writeStringBits('0011');
bitStream.writeStringBits('0011'); // 00110011
```

## Node Commands

### Install Dev Dependencies

```bash
npm install
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
```

### Documentation

```bash
npm run doc
```

(Create files in the Doc directory)