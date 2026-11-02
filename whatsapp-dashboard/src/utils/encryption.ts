import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "whatsapp-ai-ecosystem-secret-key-32"; // Must be 32 chars
const IV_LENGTH = 16;

export function encrypt(text: string) {
  if (!text) return text;
  if (text.startsWith("enc:")) return text; // already encrypted
  try {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return "enc:" + iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (e) {
    return text;
  }
}

export function decrypt(text: string) {
  if (!text || !text.startsWith("enc:")) return text;
  try {
    let textParts = text.replace("enc:", "").split(":");
    let iv = Buffer.from(textParts.shift()!, "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text; // fallback
  }
}
