package com.phongtro247.housing.config;

import com.phongtro247.housing.common.message.MessageCatalog;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.phongtro247.housing.common.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecretKey jwtSecretKey(@Value("${app.security.jwt-secret}") String secret) {
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);
        if (key.length < 32) {
            throw new IllegalStateException(MessageCatalog.ERR_JWT_SECRET_TOO_SHORT.message());
        }
        return new SecretKeySpec(key, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey secretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey secretKey) {
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                             JwtAuthenticationFilter jwtAuthenticationFilter,
                                             CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/api/health", "/actuator/health", "/actuator/info", "/api/auth/**").permitAll()
                        .requestMatchers("/api/payment/momo/callback", "/api/payment/momo/check-status").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/listings/my-listings").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/master-data/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/locations/**", "/og/**", "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/tenants/wards").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/listing-reports/my-reports").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/listing-reports").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/listing-reports").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/listing-reports/**").hasRole("ADMIN")
                        .requestMatchers("/api/videos/all-requests", "/api/videos/admin-requests",
                                "/api/videos/approve-video/**", "/api/videos/reject-video/**", "/api/videos/remove/**",
                                "/api/hot-listings/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,
                                "/api/listings/home",
                                "/api/listings/hot",
                                "/api/listings/by-type",
                                "/api/listings/videos",
                                "/api/listings/location-stats",
                                "/api/listings/*").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:5176,http://localhost:3000}") String allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
