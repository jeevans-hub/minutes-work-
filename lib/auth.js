import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error('[Auth] JWT Verification Error:', err.message);
    return null;
  }
}

export function getTokenFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  console.log('[Auth] Incoming Cookies:', cookieHeader);

  // Try Next.js native way first
  if (request.cookies && typeof request.cookies.get === 'function') {
    const tokenObj = request.cookies.get('token');
    const token = tokenObj?.value || (typeof tokenObj === 'string' ? tokenObj : null);
    console.log('[Auth] Extracted token (Native):', token ? `${token.substring(0, 10)}...` : 'NONE');
    if (token) return token;
  }

  // Fallback to manual parsing
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );
  console.log('[Auth] Extracted token (Manual):', cookies.token ? `${cookies.token.substring(0, 10)}...` : 'NONE');
  return cookies.token || null;
}

export function getUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    console.log('[Auth] No token found in request');
    return null;
  }
  
  try {
    const user = verifyToken(token);
    if (user) {
      console.log('[Auth] Verification Success:', user.email);
      return user;
    } else {
      console.log('[Auth] Verification Failed: verifyToken returned null');
      return null;
    }
  } catch (err) {
    console.error('[Auth] Verification Error:', err.message);
    return null;
  }
}
