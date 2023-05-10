const hexToUint8Array = (hex: any) => {
  const uint8Array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byteValue = parseInt(hex.substr(i, 2), 16);
    uint8Array[i / 2] = byteValue;
  }
  return uint8Array;
}

// const public_key = 'ed0120e97730197bb1aefaa7d1c01b13534a3a5311babf67b7c00c5bfaaa1498ecf634';
// const hexString = public_key.substring(6)
// console.log(hexToUint8Array(hexString));
export {
  hexToUint8Array
}