package com.rideconnect.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.function.Consumer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // 1. Enable a simple memory-based message broker
        // Frontend subscribes to /topic/user/{email}
        config.enableSimpleBroker("/topic");
        // 2. Prefix for messages sent FROM client to server (if needed)
        config.setApplicationDestinationPrefixes("/app");

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 3. Register the endpoint the client connects to
        // Allowed origins * fixes CORS for sockets
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
