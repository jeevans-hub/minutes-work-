import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const secret = process.env.JWT_SECRET;
console.log('Secret:', secret);

const token = jwt.sign({ id: 'test' }, secret);
console.log('Token:', token);

try {
    const verified = jwt.verify(token, secret);
    console.log('Verified:', verified);
} catch (err) {
    console.error('Verification failed:', err.message);
}
