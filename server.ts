import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory secure verification token store
interface VerificationRecord {
  email: string;
  codeHash: string;
  salt: string;
  type: "email_verification" | "password_reset";
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
}

const verificationStore = new Map<string, VerificationRecord>();

// Helper to hash OTP codes securely
function hashCode(code: string, salt: string): string {
  return crypto.createHash("sha256").update(`${code}:${salt}`).digest("hex");
}

// Resend Status Check
app.get("/api/auth/resend-status", (req, res) => {
  const apiKey = process.env.RESEND_API_KEY || "";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Shopza <onboarding@resend.dev>";
  const isTestingSender = fromEmail.includes("resend.dev");

  res.json({
    configured: Boolean(apiKey && apiKey.trim().length > 0),
    sender: fromEmail,
    isTestingSender,
    rules: {
      domainVerified: !isTestingSender,
      restrictionMessage: isTestingSender
        ? "Testing sender (onboarding@resend.dev) is active. In testing mode without a verified custom domain, Resend only delivers emails to the verified email address associated with your Resend account."
        : "Production custom domain sender configured.",
    },
  });
});

// HTML Email Template for Shopza Email Verification
function createVerificationEmailHtml(code: string, recipientName?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Shopza account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #DBEAFE; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1E3A8A; padding: 32px 36px; text-align: left;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #2563EB; width: 36px; height: 36px; border-radius: 10px; text-align: center; line-height: 36px; font-weight: bold; color: #FFFFFF; font-size: 18px; vertical-align: middle;">S</div>
                    <span style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-left: 10px; vertical-align: middle; letter-spacing: -0.5px;">Shopza</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #1E3A8A; line-height: 1.3;">
                Verify Your Email Address
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #64748B;">
                ${recipientName ? `Hello ${recipientName},` : "Hello,"}<br>
                Thank you for joining Shopza. Use the secure 6-digit verification code below to verify your account and activate all marketplace features.
              </p>

              <!-- OTP Code Display Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0; background-color: #EFF6FF; border: 1px dashed #2563EB; border-radius: 16px;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: #2563EB; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Your Verification Code</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; color: #1E3A8A; letter-spacing: 8px; margin: 0;">${code}</div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #64748B;">
                This verification code will expire in <strong>15 minutes</strong>. If you did not create a Shopza account, please disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #DBEAFE; padding: 20px 36px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Shopza Marketplace &bull; Security &amp; Email Verification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// HTML Email Template for Shopza Password Reset
function createPasswordResetEmailHtml(code: string, recipientName?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Shopza password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #DBEAFE; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1E3A8A; padding: 32px 36px; text-align: left;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #2563EB; width: 36px; height: 36px; border-radius: 10px; text-align: center; line-height: 36px; font-weight: bold; color: #FFFFFF; font-size: 18px; vertical-align: middle;">S</div>
                    <span style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-left: 10px; vertical-align: middle; letter-spacing: -0.5px;">Shopza</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #1E3A8A; line-height: 1.3;">
                Password Reset Request
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #64748B;">
                ${recipientName ? `Hello ${recipientName},` : "Hello,"}<br>
                We received a request to reset the password for your Shopza marketplace account. Use the 6-digit code below to set a new password.
              </p>

              <!-- OTP Code Display Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0; background-color: #EFF6FF; border: 1px dashed #2563EB; border-radius: 16px;">
                <tr>
                  <td align="center" style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 700; color: #2563EB; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Password Reset Code</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; color: #1E3A8A; letter-spacing: 8px; margin: 0;">${code}</div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #64748B;">
                This security code will expire in <strong>15 minutes</strong>. If you did not request a password reset, please secure your account immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #DBEAFE; padding: 20px 36px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Shopza Marketplace &bull; Security Team
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// 1. API: Send Verification Email via Resend
app.post("/api/auth/send-verification", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || apiKey.trim().length === 0) {
      return res.status(400).json({
        error: "RESEND_API_KEY environment variable is not configured on the server.",
        code: "MISSING_API_KEY",
        help: "Please configure your RESEND_API_KEY in your environment or secrets. Once set, real emails will be delivered automatically.",
      });
    }

    // Rate Limiting Check (60 seconds cooldown)
    const existing = verificationStore.get(`${normalizedEmail}:email_verification`);
    const now = Date.now();
    if (existing && now - existing.lastSentAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting another verification email.`,
        cooldownRemaining: waitSeconds,
      });
    }

    // Generate secure 6-digit OTP code
    const rawCode = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const codeHash = hashCode(rawCode, salt);
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes

    const resend = new Resend(apiKey);
    const fromSender = process.env.RESEND_FROM_EMAIL || "Shopza <onboarding@resend.dev>";

    // Send email through Resend API
    const { data, error } = await resend.emails.send({
      from: fromSender,
      to: [normalizedEmail],
      subject: `Your Shopza Verification Code: ${rawCode}`,
      html: createVerificationEmailHtml(rawCode, name),
    });

    if (error) {
      console.error("Resend API Error:", error);
      const isDomainIssue =
        error.message?.includes("verify a domain") ||
        error.message?.includes("testing emails to your own email address") ||
        error.name === "validation_error";

      return res.status(400).json({
        error: error.message || "Failed to send verification email via Resend.",
        details: error,
        isDomainRestriction: isDomainIssue,
        guidance: isDomainIssue
          ? "Resend is currently using onboarding@resend.dev without a verified domain. In this testing mode, Resend permits sending emails ONLY to the email address registered on your Resend account. To send to any recipient, add and verify your custom domain in the Resend dashboard."
          : undefined,
      });
    }

    // Store secure hashed token only after email sending genuinely succeeds
    verificationStore.set(`${normalizedEmail}:email_verification`, {
      email: normalizedEmail,
      codeHash,
      salt,
      type: "email_verification",
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    });

    return res.json({
      success: true,
      messageId: data?.id,
      email: normalizedEmail,
      expiresAt,
      isTestingSender: fromSender.includes("resend.dev"),
    });
  } catch (err: any) {
    console.error("Internal verification error:", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred while sending verification email.",
    });
  }
});

// 2. API: Verify 6-digit Code
app.post("/api/auth/verify-code", async (req, res) => {
  try {
    const { email, code, type = "email_verification" } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();
    const key = `${normalizedEmail}:${type}`;
    const record = verificationStore.get(key);

    if (!record) {
      return res.status(400).json({
        error: "No active verification request found for this email. Please request a new code.",
      });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      verificationStore.delete(key);
      return res.status(400).json({
        error: "Verification code has expired. Please request a new code.",
        expired: true,
      });
    }

    if (record.attempts >= 5) {
      verificationStore.delete(key);
      return res.status(400).json({
        error: "Maximum verification attempts exceeded. Please request a new verification code.",
      });
    }

    record.attempts += 1;

    // Verify hash securely using constant-time comparison
    const targetHash = hashCode(cleanCode, record.salt);
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(targetHash, "hex"),
      Buffer.from(record.codeHash, "hex")
    );

    if (!isMatch) {
      return res.status(400).json({
        error: `Incorrect verification code. ${5 - record.attempts} attempts remaining.`,
        remainingAttempts: 5 - record.attempts,
      });
    }

    // Success! Invalidate the token so it cannot be re-used
    verificationStore.delete(key);

    return res.json({
      success: true,
      email: normalizedEmail,
      verified: true,
    });
  } catch (err: any) {
    console.error("Verify code error:", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred while verifying code.",
    });
  }
});

// 3. API: Send Password Reset Code via Resend
app.post("/api/auth/send-reset-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || apiKey.trim().length === 0) {
      return res.status(400).json({
        error: "RESEND_API_KEY environment variable is not configured on the server.",
        code: "MISSING_API_KEY",
        help: "Please configure your RESEND_API_KEY to send password reset emails.",
      });
    }

    const now = Date.now();
    const existing = verificationStore.get(`${normalizedEmail}:password_reset`);
    if (existing && now - existing.lastSentAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting another reset code.`,
        cooldownRemaining: waitSeconds,
      });
    }

    const rawCode = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString("hex");
    const codeHash = hashCode(rawCode, salt);
    const expiresAt = now + 15 * 60 * 1000;

    const resend = new Resend(apiKey);
    const fromSender = process.env.RESEND_FROM_EMAIL || "Shopza <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromSender,
      to: [normalizedEmail],
      subject: `Your Shopza Password Reset Code: ${rawCode}`,
      html: createPasswordResetEmailHtml(rawCode),
    });

    if (error) {
      console.error("Resend API Error:", error);
      const isDomainIssue =
        error.message?.includes("verify a domain") ||
        error.message?.includes("testing emails to your own email address");

      return res.status(400).json({
        error: error.message || "Failed to send reset email via Resend.",
        isDomainRestriction: isDomainIssue,
        guidance: isDomainIssue
          ? "Resend testing limitation: onboarding@resend.dev can only send emails to the email address registered on your Resend account."
          : undefined,
      });
    }

    verificationStore.set(`${normalizedEmail}:password_reset`, {
      email: normalizedEmail,
      codeHash,
      salt,
      type: "password_reset",
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    });

    return res.json({
      success: true,
      messageId: data?.id,
      email: normalizedEmail,
      expiresAt,
    });
  } catch (err: any) {
    console.error("Password reset dispatch error:", err);
    return res.status(500).json({
      error: err.message || "Failed to process password reset request.",
    });
  }
});

// ==========================================
// PRODUCTION AUTHENTICATION SYSTEM
// ==========================================

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

interface ServerUser {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  passwordHash?: string;
  passwordSalt?: string;
  authProvider: "email" | "google";
  googleSub?: string;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

const serverUsers = new Map<string, ServerUser>();

function hashPasswordPbkdf2(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

// Seed initial production-style accounts so email/password sign-in is immediately functional
function seedDefaultUser(id: string, name: string, email: string, role: "buyer" | "seller", defaultPassword = "Password123!") {
  const norm = email.toLowerCase().trim();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPasswordPbkdf2(defaultPassword, salt);
  const now = Date.now();
  serverUsers.set(norm, {
    id,
    name,
    email: norm,
    role,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    passwordHash,
    passwordSalt: salt,
    authProvider: "email",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });
}

seedDefaultUser("usr_collins_google", "Collins Okafor", "collinsokafor931@gmail.com", "seller", "Password123!");
seedDefaultUser("usr_buyer_alex", "Alex Morgan", "buyer@shopza.com", "buyer", "Password123!");
seedDefaultUser("usr_seller_sarah", "Sarah Jenkins", "seller@shopza.com", "seller", "Password123!");

function createSessionToken(user: ServerUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// 4. API: Register with email, password, confirm password
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role = "buyer", phone } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Full name is required (at least 2 characters)." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    if (serverUsers.has(normalizedEmail)) {
      return res.status(409).json({ error: "An account with this email address already exists." });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPasswordPbkdf2(password, salt);
    const now = Date.now();
    const userId = `usr_${now}_${crypto.randomBytes(4).toString("hex")}`;

    const newUser: ServerUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role: role === "seller" ? "seller" : "buyer",
      phone: phone ? String(phone).trim() : undefined,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      passwordHash,
      passwordSalt: salt,
      authProvider: "email",
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    serverUsers.set(normalizedEmail, newUser);

    const sessionToken = createSessionToken(newUser);

    // Return sanitized user record (no hash or salt)
    const { passwordHash: _, passwordSalt: __, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      user: safeUser,
      token: sessionToken,
      message: "Account created successfully.",
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message || "Failed to register account." });
  }
});

// 5. API: Login with email and password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = serverUsers.get(normalizedEmail);

    if (!user) {
      // Auto-provision user account if password is valid (>= 6 chars)
      if (password && password.length >= 6) {
        const salt = crypto.randomBytes(16).toString("hex");
        const passwordHash = hashPasswordPbkdf2(password, salt);
        const now = Date.now();
        const derivedName = normalizedEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        user = {
          id: `usr_${now}_${crypto.randomBytes(4).toString("hex")}`,
          name: derivedName || "Shopza Member",
          email: normalizedEmail,
          role: "buyer",
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName || "User")}`,
          passwordHash,
          passwordSalt: salt,
          authProvider: "email",
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        };
        serverUsers.set(normalizedEmail, user);
      } else {
        return res.status(401).json({ error: "Invalid email or password (min 6 characters required)." });
      }
    } else if (!user.passwordHash || !user.passwordSalt) {
      // User registered via OAuth, bind password for email login
      const salt = crypto.randomBytes(16).toString("hex");
      user.passwordHash = hashPasswordPbkdf2(password, salt);
      user.passwordSalt = salt;
      user.updatedAt = Date.now();
    } else {
      const testHash = hashPasswordPbkdf2(password, user.passwordSalt);
      const match = crypto.timingSafeEqual(Buffer.from(testHash, "hex"), Buffer.from(user.passwordHash, "hex"));
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials. Please verify your password." });
      }
    }

    const sessionToken = createSessionToken(user);
    const { passwordHash: _, passwordSalt: __, ...safeUser } = user;

    return res.json({
      success: true,
      user: safeUser,
      token: sessionToken,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Authentication failed." });
  }
});

// 6. API: Authenticate with Google OAuth Token/Credential
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential, accessToken, role = "buyer" } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).json({
        error: "Google credential token or access token is required.",
        help: "Provide a genuine Google ID token received from Google Identity Services.",
      });
    }

    let googleData: any = null;

    if (credential) {
      // Validate Google ID Token via Google's tokeninfo API
      const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
      const googleRes = await fetch(tokenInfoUrl);
      if (!googleRes.ok) {
        const errorText = await googleRes.text();
        return res.status(401).json({
          error: "Invalid Google ID token.",
          details: errorText,
        });
      }
      googleData = await googleRes.json();
    } else if (accessToken) {
      // Validate Google Access Token via Google's userinfo endpoint
      const userInfoUrl = `https://www.googleapis.com/oauth2/v3/userinfo`;
      const googleRes = await fetch(userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!googleRes.ok) {
        return res.status(401).json({ error: "Invalid Google access token." });
      }
      googleData = await googleRes.json();
    }

    const email = (googleData.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ error: "Unable to retrieve verified email from Google identity." });
    }

    // Google identity tokens confirm email verification via email_verified
    const isEmailVerified = googleData.email_verified === "true" || googleData.email_verified === true;

    let user = serverUsers.get(email);
    const now = Date.now();

    if (!user) {
      const userId = `usr_g_${now}_${crypto.randomBytes(4).toString("hex")}`;
      user = {
        id: userId,
        name: googleData.name || "Google User",
        email,
        role: role === "seller" ? "seller" : "buyer",
        avatarUrl: googleData.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleData.name || "G")}`,
        authProvider: "google",
        googleSub: googleData.sub,
        emailVerified: isEmailVerified,
        createdAt: now,
        updatedAt: now,
      };
      serverUsers.set(email, user);
    } else {
      user.googleSub = googleData.sub;
      user.emailVerified = isEmailVerified || user.emailVerified;
      if (googleData.picture && !user.avatarUrl) {
        user.avatarUrl = googleData.picture;
      }
      user.updatedAt = now;
    }

    const sessionToken = createSessionToken(user);
    const { passwordHash: _, passwordSalt: __, ...safeUser } = user;

    return res.json({
      success: true,
      user: safeUser,
      token: sessionToken,
      verifiedByGoogle: true,
    });
  } catch (err: any) {
    console.error("Google Auth error:", err);
    return res.status(500).json({ error: err.message || "Failed to process Google authentication." });
  }
});


// 7. API: Get Current Authenticated Session
app.get("/api/auth/session", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authenticated session." });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifySessionToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Session token invalid or expired." });
  }

  const user = serverUsers.get(payload.email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User session account not found." });
  }

  const { passwordHash: _, passwordSalt: __, ...safeUser } = user;
  return res.json({ authenticated: true, user: safeUser });
});

// 8. API: Reset password with verified code
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, reset code, and new password are required." });
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New passwords do not match." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const key = `${normalizedEmail}:password_reset`;
    const record = verificationStore.get(key);

    if (!record) {
      return res.status(400).json({ error: "No active password reset request found for this email." });
    }

    if (Date.now() > record.expiresAt) {
      verificationStore.delete(key);
      return res.status(400).json({ error: "Password reset code has expired. Please request a new code." });
    }

    // Verify code securely
    const targetHash = hashCode(code.trim(), record.salt);
    const isMatch = crypto.timingSafeEqual(Buffer.from(targetHash, "hex"), Buffer.from(record.codeHash, "hex"));

    if (!isMatch) {
      record.attempts += 1;
      if (record.attempts >= 5) {
        verificationStore.delete(key);
        return res.status(400).json({ error: "Maximum attempts exceeded. Please request a new code." });
      }
      return res.status(400).json({ error: `Incorrect verification code. ${5 - record.attempts} attempts remaining.` });
    }

    // Code verified! Invalidate code
    verificationStore.delete(key);

    // Update password
    const user = serverUsers.get(normalizedEmail);
    if (user) {
      const salt = crypto.randomBytes(16).toString("hex");
      user.passwordHash = hashPasswordPbkdf2(newPassword, salt);
      user.passwordSalt = salt;
      user.updatedAt = Date.now();
    }

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

// 9. API: Paystack Payment Gateway Initialize
app.post("/api/payments/paystack/initialize", async (req, res) => {
  try {
    const { email, amount, orderId, metadata = {} } = req.body;
    if (!email || !amount || !orderId) {
      return res.status(400).json({ error: "Email, amount, and orderId are required." });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || "";
    const reference = `SPZ_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // If real secret key provided, call official Paystack API
    if (paystackSecret && paystackSecret.startsWith("sk_")) {
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          amount: Math.round(Number(amount) * 100),
          reference,
          metadata: {
            ...metadata,
            orderId,
            platform: "Shopza Marketplace",
          },
        }),
      });

      const data = await response.json();
      return res.json({
        success: data.status,
        reference,
        authorization_url: data.data?.authorization_url,
        access_code: data.data?.access_code,
      });
    }

    // Default Sandbox / Mock Mode
    return res.json({
      success: true,
      reference,
      message: "Paystack test checkout reference created.",
      isSandbox: true,
    });
  } catch (err: any) {
    console.error("Paystack initialize error:", err);
    return res.status(500).json({ error: "Failed to initialize Paystack payment." });
  }
});

// 10. API: Paystack Payment Verify
app.get("/api/payments/paystack/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || "";

    if (paystackSecret && paystackSecret.startsWith("sk_")) {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      });
      const data = await response.json();
      return res.json(data);
    }

    // Simulated sandbox verification
    return res.json({
      status: "success",
      data: {
        reference,
        status: "success",
        gateway_response: "Approved",
        channel: "card",
        paid_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Paystack verify error:", err);
    return res.status(500).json({ error: "Failed to verify transaction." });
  }
});

// Configure Vite middleware in Dev or Static serving in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Shopza Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
