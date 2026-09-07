import { encode } from "@auth/core/jwt";

const secret = "zCNmPdRHMvuv2ykZ5K/V/xd04Ct2W3qgru++u1m0Rt4=";
const salt = "authjs.session-token";

const token = {
  sub: "00000000-0000-0000-0000-000000000001",
  id: "00000000-0000-0000-0000-000000000001",
  name: "Test Admin",
  email: "admin@axiom.test",
  role: "admin",
  accessProfile: "admin",
  department: null,
  countryScope: null,
  regionScope: null,
  supplierId: null,
  onboardingCompleted: true,
  isTwoFactorEnabled: false,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  jti: "test-jti",
};

const value = await encode({ secret, token, salt });
console.log("COOKIE_VALUE=" + value);
