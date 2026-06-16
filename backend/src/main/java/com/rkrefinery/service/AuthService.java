package com.rkrefinery.service;

import com.rkrefinery.dto.auth.*;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}