import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconMapPin, IconSearch, IconX, IconMap } from "@tabler/icons-react";

const LocationSearch = ({
  onLocationSelect,
  currentLocation,
  theme = "light",
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(currentLocation?.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputMode, setInputMode] = useState("search"); // "search" or "coordinates"
  const [coordinates, setCoordinates] = useState({
    latitude: currentLocation?.latitude?.toString() || "",
    longitude: currentLocation?.longitude?.toString() || "",
  });
  const [coordinateErrors, setCoordinateErrors] = useState({
    latitude: "",
    longitude: "",
  });
  const [debounceTimer, setDebounceTimer] = useState(null);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Update search query and coordinates when currentLocation changes
  useEffect(() => {
    if (currentLocation?.name && currentLocation.name !== searchQuery) {
      setSearchQuery(currentLocation.name);
    }
    if (currentLocation?.latitude && currentLocation?.longitude) {
      setCoordinates({
        latitude: currentLocation.latitude.toString(),
        longitude: currentLocation.longitude.toString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for locations when query changes
  useEffect(() => {
    const searchLocations = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const language = t("language_code", "en");
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery
          )}&format=json&addressdetails=1&limit=8&accept-language=${language}`
        );
        const data = await response.json();

        const formattedSuggestions = data.map((item) => ({
          id: item.place_id,
          name: item.display_name,
          country: item.address?.country || "",
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          type: item.type,
        }));

        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error searching locations:", error);
        setSuggestions([]);
      }
      setIsLoading(false);
    };

    const timeoutId = setTimeout(searchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, t]);

  const handleSelectLocation = (location) => {
    const selectedLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name.split(",")[0],
      country: location.country,
      language: t("language_code", "en"),
      isManual: true,
    };

    onLocationSelect(selectedLocation);
    setSearchQuery(`${location.name}${location.country ? `, ${location.country}` : ""}`);
    setShowSuggestions(false);
  };

  // Validate coordinate values
  const validateCoordinates = (lat, lng) => {
    const errors = { latitude: "", longitude: "" };
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (!lat || lat.trim() === "" || isNaN(latNum)) {
      errors.latitude = t("latitude_required", "Latitude is required");
    } else if (latNum < -90 || latNum > 90) {
      errors.latitude = t("latitude_invalid", "Latitude must be between -90 and 90");
    }
    
    if (!lng || lng.trim() === "" || isNaN(lngNum)) {
      errors.longitude = t("longitude_required", "Longitude is required");
    } else if (lngNum < -180 || lngNum > 180) {
      errors.longitude = t("longitude_invalid", "Longitude must be between -180 and 180");
    }
    
    return errors;
  };

  // Fetch place name from coordinates
  const fetchPlaceName = async (lat, lng) => {
    console.log("fetchPlaceName called with:", { lat, lng }); // Debug logging
    
    try {
      setIsLoading(true);
      
      // Fetch place name from Nominatim API using reverse geocoding
      const language = t("language_code", "en");
      const apiUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${language}&addressdetails=1`;
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Nominatim API response:", data); // Debug logging
        
        // Use display_name from the API response, fallback to custom coordinates if empty
        let placeName;
        if (data && data.display_name && data.display_name.trim()) {
          placeName = data.display_name;
          console.log("Using API place name:", placeName);
        } else {
          placeName = `Custom Coordinates (${lat}, ${lng})`;
          console.log("Using fallback place name:", placeName);
        }
        
        const selectedLocation = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          name: placeName,
          country: "",
          language: language,
          isManual: true,
          isCoordinates: true,
        };
        
        console.log("Selected location:", selectedLocation);
        onLocationSelect(selectedLocation);
      } else {
        console.error("Nominatim API failed with status:", response.status);
        // Fallback to custom coordinates if API fails
        const fallbackName = `Custom Coordinates (${lat}, ${lng})`;
        const selectedLocation = {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          name: fallbackName,
          country: "",
          language: t("language_code", "en"),
          isManual: true,
          isCoordinates: true,
        };
        
        console.log("Using fallback location (API failed):", selectedLocation);
        onLocationSelect(selectedLocation);
      }
    } catch (error) {
      console.error("Error fetching place name:", error);
      
      // Fallback to custom coordinates if there's an error
      const fallbackName = `Custom Coordinates (${lat}, ${lng})`;
      const selectedLocation = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        name: fallbackName,
        country: "",
        language: t("language_code", "en"),
        isManual: true,
        isCoordinates: true,
      };
      
      console.log("Using fallback location (error):", selectedLocation);
      onLocationSelect(selectedLocation);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle coordinate input changes with validation
  const handleCoordinateChange = (field, value) => {
    console.log(`Coordinate change - ${field}: "${value}"`); // Debug logging
    
    setCoordinates(prev => {
      const newCoords = { ...prev, [field]: value };
      console.log("New coordinates state:", newCoords); // Debug logging
      return newCoords;
    });
    
    // Clear specific field error when user starts typing
    if (coordinateErrors[field]) {
      setCoordinateErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Auto-validate coordinates
    const newCoordinates = { ...coordinates, [field]: value };
    const errors = validateCoordinates(newCoordinates.latitude, newCoordinates.longitude);
    setCoordinateErrors(errors);

    console.log("Validation errors:", errors); // Debug logging
    console.log("Checking if valid:", {
      lat: newCoordinates.latitude,
      lng: newCoordinates.longitude,
      latValid: !errors.latitude,
      lngValid: !errors.longitude,
      bothNotEmpty: newCoordinates.latitude && newCoordinates.latitude.trim() !== "" && 
                   newCoordinates.longitude && newCoordinates.longitude.trim() !== ""
    });

    // If both coordinates are valid and not empty, debounce the API call
    if (!errors.latitude && !errors.longitude && 
        newCoordinates.latitude && newCoordinates.latitude.trim() !== "" &&
        newCoordinates.longitude && newCoordinates.longitude.trim() !== "") {
      
      console.log("Triggering API call for coordinates:", newCoordinates.latitude, newCoordinates.longitude);
      
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer for API call
      const timer = setTimeout(() => {
        fetchPlaceName(newCoordinates.latitude, newCoordinates.longitude);
      }, 1000); // 1 second delay

      setDebounceTimer(timer);
    } else {
      console.log("Not triggering API call - validation failed or empty fields");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearCoordinates = () => {
    setCoordinates({ latitude: "", longitude: "" });
    setCoordinateErrors({ latitude: "", longitude: "" });
  };

  return (
    <div className="relative w-full">
      {/* Mode Toggle */}
      <div className="flex mb-4 bg-bg-color-2 rounded-lg p-1">
        <button
          onClick={() => setInputMode("search")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            inputMode === "search"
              ? `bg-${window.api.getColor()}-500 text-white shadow-lg`
              : `text-text-2 hover:text-text hover:bg-${window.api.getColor()}-500/10`
          }`}
        >
          <IconSearch size={16} />
          {t("search_by_name", "Search by Name")}
        </button>
        <button
          onClick={() => setInputMode("coordinates")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            inputMode === "coordinates"
              ? `bg-${window.api.getColor()}-500 text-white shadow-lg`
              : `text-text-2 hover:text-text hover:bg-${window.api.getColor()}-500/10`
          }`}
        >
          <IconMap size={16} />
          {t("enter_coordinates", "Enter Coordinates")}
        </button>
      </div>

      {/* Search Input Mode */}
      {inputMode === "search" && (
        <>
          <div ref={searchRef} className="relative">
            <div className="relative">
              <IconSearch
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-2"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  "search_location",
                  "Search for your city or region..."
                )}
                className="w-full pl-10 pr-10 py-3 bg-bg-color border border-bg-color-3 rounded-lg text-text placeholder-text-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-2 hover:text-text"
                >
                  <IconX size={16} />
                </button>
              )}
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-bg-color border border-bg-color-3 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelectLocation(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-bg-color-2 transition-colors border-b border-bg-color-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <IconMapPin size={16} className="text-text-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {suggestion.name}{suggestion.country ? `, ${suggestion.country}` : ""}
                      </p>
                      {suggestion.country && (
                        <p className="text-xs text-text-2 truncate">
                          {suggestion.country}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {showSuggestions &&
            suggestions.length === 0 &&
            searchQuery.length >= 2 &&
            !isLoading && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-bg-color border border-bg-color-3 rounded-lg shadow-lg p-4 z-50"
              >
                <p className="text-sm text-text-2 text-center">
                  {t("no_locations_found", "No locations found")}
                </p>
              </div>
            )}
        </>
      )}

      {/* Coordinates Input Mode */}
      {inputMode === "coordinates" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Latitude Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t("latitude", "Latitude")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={coordinates.latitude}
                  onChange={(e) => handleCoordinateChange("latitude", e.target.value)}
                  className={`w-full px-3 py-3 bg-bg-color border rounded-lg text-text placeholder-text-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    coordinateErrors.latitude ? "border-red-500" : "border-bg-color-3"
                  }`}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              {coordinateErrors.latitude && (
                <p className="text-red-500 text-xs mt-1">{coordinateErrors.latitude}</p>
              )}
            </div>

            {/* Longitude Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t("longitude", "Longitude")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={coordinates.longitude}
                  onChange={(e) => handleCoordinateChange("longitude", e.target.value)}
                  className={`w-full px-3 py-3 bg-bg-color border rounded-lg text-text placeholder-text-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    coordinateErrors.longitude ? "border-red-500" : "border-bg-color-3"
                  }`}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              {coordinateErrors.longitude && (
                <p className="text-red-500 text-xs mt-1">{coordinateErrors.longitude}</p>
              )}
            </div>
          </div>

          {/* Clear Button */}
          <div className="flex justify-end">
            <button
              onClick={clearCoordinates}
              className="px-4 py-2 bg-bg-color-2 text-text-2 rounded-lg hover:bg-bg-color-3 transition-colors flex items-center gap-2"
            >
              <IconX size={16} />
              {t("reset", "Reset")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
