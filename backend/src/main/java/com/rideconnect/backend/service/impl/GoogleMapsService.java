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

@Service
public class GoogleMapsService {

    @Value("${google.maps.api.key}")
    private String apiKey;

    private GeoApiContext getContext() {
        return new GeoApiContext.Builder().apiKey(apiKey).build();
    }

    // 1. Get Coordinates (Lat, Lng) for a City Name
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

    // 2. Get the full path (list of points) between source and dest
    public List<LatLng> getRoutePoints(String source, String destination) {
        try {
            DirectionsResult result = DirectionsApi.newRequest(getContext())
                    .origin(source)
                    .destination(destination)
                    .await();

            if (result.routes.length > 0) {
                // Decode the "overview polyline" into a list of GPS points
                return result.routes[0].overviewPolyline.decodePath();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // 3. Get Distance in KM (Using Directions API)
    // This uses the exact same route logic as the Polyline
    public Double getDistanceInKm(String source, String destination) {
        try {
            DirectionsResult result = DirectionsApi.newRequest(getContext())
                    .origin(source)
                    .destination(destination)
                    .await();

            if (result.routes.length > 0 && result.routes[0].legs.length > 0) {
                // Google returns distance in meters
                long distanceInMeters = result.routes[0].legs[0].distance.inMeters;
                // Convert to KM
                return distanceInMeters / 1000.0;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Return null so the caller (RideService) can handle fallback logic if needed
        return null;
    }
}