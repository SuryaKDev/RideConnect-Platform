package com.rideconnect.backend.service.impl;

import com.google.maps.DirectionsApi;
import com.google.maps.GeocodingApi;
import com.google.maps.GeoApiContext;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class GoogleMapsService {

    @Value("${google.maps.api.key}")
    private String apiKey;

    private GeoApiContext getContext() {
        return new GeoApiContext.Builder().apiKey(apiKey).build();
    }

    // 1. Get Coordinates
    public LatLng getCoordinates(String city) {
        try {
            GeocodingResult[] results = GeocodingApi.newRequest(getContext())
                    .address(city)
                    .await();

            if (results.length > 0) {
                return results[0].geometry.location;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // 2. OPTIMIZED: Get Both Polyline and Distance in ONE call
    public Map<String, Object> getRouteDetails(String source, String destination) {
        try {
            DirectionsResult result = DirectionsApi.newRequest(getContext())
                    .origin(source)
                    .destination(destination)
                    .await();

            if (result.routes.length > 0) {
                Map<String, Object> details = new HashMap<>();

                // Decode Polyline
                details.put("path", result.routes[0].overviewPolyline.decodePath());

                // Get Distance (in KM)
                if (result.routes[0].legs.length > 0) {
                    long distanceMeters = result.routes[0].legs[0].distance.inMeters;
                    details.put("distance", distanceMeters / 1000.0);
                }

                return details;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}