import { createContext, useContext, useEffect, useState } from "react";
import Geocode from "react-geocode";
import { AddressGoogleDialog } from "../../components/shared/location/address-google-dialog";
import { GOOGLE_MAPS_API_KEY } from "../constants/google.const";
import { useToast } from "./toast-provider";

interface UserLocation {
  fullAddress: string;
  lng: number;
  lat: number;
}

export const LocationContext = createContext<
  Partial<{
    userLocation: UserLocation;
    setUserLocation: (location: UserLocation) => any;
    openLocation: (required?: boolean) => any;
  }>
>({});

export function LocationProvider({
  fullAddress = "Hồ chí minh",
  lat = 10.762622,
  lng = 106.660172,
  ...props
}) {
  const [userLocation, setUserLocation] = useState<UserLocation>();
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const toast = useToast();

  const openLocation = (required: boolean) => {
    if (required) {
      setIsRequired(true);
    }
    setOpenLocationDialog(true);
  };

  useEffect(() => {
    if (userLocation) {
      localStorage.setItem("customer-location", JSON.stringify(userLocation));
    } else if (userLocation === null) {
      localStorage.removeItem("customer-location");
    }
  }, [userLocation]);

  const initLocation = () => {
    Geocode.setApiKey(GOOGLE_MAPS_API_KEY);
    Geocode.setLanguage("vi");
    Geocode.setRegion("vn");
    let location = localStorage.getItem("customer-location");
    if (location) {
      setUserLocation(JSON.parse(location));
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationFromLatLng(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            setLocationFromLatLng(lat, lng);
          }
        );
      } else {
        setLocationFromLatLng(lat, lng);
      }
    }
  };

  const setLocationFromLatLng = (lat: number, lng: number) => {
    Geocode.fromLatLng(
      lat.toString(), // position.coords.latitude.toString(),
      lng.toString() // position.coords.longitude.toString(),
    ).then(
      (response) => {
        if (response.results.length) {
          const fullAddress = response.results[0].formatted_address;
          setUserLocation({
            fullAddress,
            lat: response.results[0].geometry.location.lat,
            lng: response.results[0].geometry.location.lng,
          });
        } else {
          setUserLocation(null);
        }
      },
      (error) => {
        console.error(error);
      }
    );
  };

  useEffect(() => {
    initLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        openLocation,
        setUserLocation,
      }}
    >
      {props.children}
      <AddressGoogleDialog
        isOpen={openLocationDialog}
        fullAddress={userLocation?.fullAddress}
        onClose={() => {
          if (isRequired && !userLocation) {
            toast.info("Cần chọn địa chỉ giao hàng gần nhất");
          } else {
            setOpenLocationDialog(false);
          }
        }}
        onChange={(data) => {
          if (data.fullAddress) {
            setUserLocation({
              fullAddress: data.fullAddress,
              lat: data.lat,
              lng: data.lng,
            });
            setOpenLocationDialog(false);
            setIsRequired(false);
          }
        }}
      />
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
