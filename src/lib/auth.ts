import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "lms-mvp-secret";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || !decoded.sub) return null;
    return decoded as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function tokenFromRequest(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function authUserFromRequest(req: Request): JwtPayload | null {
  const token = tokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}
