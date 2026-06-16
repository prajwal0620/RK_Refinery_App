package com.rkrefinery.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptTool {
    public static void main(String[] args) {
        BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
        String hash = enc.encode("admin123");
        System.out.println(hash);
        System.out.println("matches? " + enc.matches("admin123", hash));
    }
}