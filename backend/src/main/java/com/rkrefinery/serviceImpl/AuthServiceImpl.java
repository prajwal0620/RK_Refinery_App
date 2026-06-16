package com.rkrefinery.serviceImpl;

import com.rkrefinery.dto.auth.*;
import com.rkrefinery.exception.BadRequestException;
import com.rkrefinery.repository.UserRepository;
import com.rkrefinery.security.JwtService;
import com.rkrefinery.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }

        return LoginResponse.builder()
                .username(user.getUsername())
                .token(jwtService.generateToken(user.getUsername()))
                .build();
    }
}