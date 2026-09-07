package com.whatsapp.ai.agent.application;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

public class EncryptionUtil {
    private static final String ENCRYPTION_KEY = "whatsapp-ai-ecosystem-secret-key-32";

    public static String decrypt(String text) {
        if (text == null || !text.startsWith("enc:")) return text;
        try {
            String[] parts = text.substring(4).split(":");
            byte[] iv = HexFormat.of().parseHex(parts[0]);
            byte[] encryptedText = HexFormat.of().parseHex(parts[1]);

            byte[] keyBytes = new byte[32];
            byte[] providedKeyBytes = ENCRYPTION_KEY.getBytes(StandardCharsets.UTF_8);
            System.arraycopy(providedKeyBytes, 0, keyBytes, 0, Math.min(providedKeyBytes.length, 32));

            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);

            return new String(cipher.doFinal(encryptedText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            System.err.println("Failed to decrypt: " + e.getMessage());
            return text;
        }
    }
}
