import binascii, hashlib
 
dk = hashlib.pbkdf2_hmac(hash_name='sha256',
    password=b'gold_lizard32',
    salt=b'lz_salt',
    iterations=100000)
 
result = binascii.hexlify(dk)
 
print(result)