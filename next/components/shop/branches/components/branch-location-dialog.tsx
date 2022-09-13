import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { RiMapPinLine } from "react-icons/ri";
import { GOOGLE_MAPS_API_KEY } from "../../../../lib/constants/google.const";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button } from "../../../shared/utilities/form/button";
import { Input } from "../../../shared/utilities/form/input";
import { Spinner, NotFound } from "../../../shared/utilities/misc";

interface PropsType extends DialogProps {
  address: string;
  location: { latitude: number; longitude: number };
  onSelectLocation: ({ latitude, longitude }) => any;
}
const LIBRARIES: any[] = ["places"];
export function BranchLocationDialog({ address, location, onSelectLocation, ...props }: PropsType) {
  const [fullAddress, setFullAddress] = useState(address);
  const [placePrediction, setPlacePrediction] = useState<
    google.maps.places.AutocompletePrediction
  >();
  const [position, setPosition] = useState<google.maps.LatLngLiteral>({
    lat: 10.7797855,
    lng: 106.6968302,
  });
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral>();
  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });
  const [map, setMap] = useState<google.maps.Map>(null);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (props.isOpen) {
      setFullAddress(address);
      if (location) {
        setPosition({ lat: location.latitude, lng: location.longitude });
      }
      if (address && !location) {
        getPlacePredictions({
          input: address,
          componentRestrictions: { country: "vn" },
        });
      }
    } else {
      setPlacePrediction(undefined);
      setPosition(null);
    }
  }, [props.isOpen]);

  useEffect(() => {
    if (map) {
      map.setZoom(18);
      if (position) {
        map.setCenter(position);
      }
    }
  }, [map, position]);

  useEffect(() => {
    if (placePrediction) {
      placesService.getDetails(
        { placeId: placePrediction.place_id, fields: ["formatted_address", "geometry"] },
        (result) => {
          setFullAddress(result.formatted_address);
          setPosition({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          });
        }
      );
    }
  }, [placePrediction]);

  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: GOOGLE_MAPS_API_KEY,
    language: "vi",
    libraries: LIBRARIES,
  });

  return (
    <Dialog width={850} title="Chọn toạ độ cửa hàng" {...props}>
      <Dialog.Body>
        <div className="mb-2 text-gray-600">
          * <b className="underline">Nhập địa chỉ</b> để đến vị trí và{" "}
          <b className="underline">kéo bản đồ</b> để đánh dấu toạ độ của cửa hàng
        </div>
        <div className="grid grid-cols-2 mb-4 gap-x-2">
          <div>
            <Input
              debounce
              clearable
              className="h-12 mb-2"
              placeholder="Tìm kiếm địa chỉ"
              value={fullAddress}
              onChange={(val) => {
                setFullAddress(fullAddress);
                getPlacePredictions({
                  input: val,
                  componentRestrictions: { country: "vn" },
                });
              }}
            />
            {isPlacePredictionsLoading && <Spinner />}
            {!isPlacePredictionsLoading && placePredictions && (
              <>
                {placePredictions.length ? (
                  <>
                    {placePredictions.map((place) => (
                      <button
                        type="button"
                        key={place.place_id}
                        className={`flex items-start w-full p-2 border-b border-gray-200 animate-emerge ${
                          place.place_id == placePrediction?.place_id
                            ? "bg-primary text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={async () => {
                          setPlacePrediction(place);
                        }}
                      >
                        <i className="mt-1 mr-2 text-base">
                          <RiMapPinLine />
                        </i>
                        <div className="text-left">
                          <div className="text-base font-semibold">
                            {place.structured_formatting.main_text}
                          </div>
                          <div className="text-sm">
                            {place.structured_formatting.secondary_text}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <NotFound text="Không tìm thấy địa chỉ" />
                )}
              </>
            )}
          </div>
          <div>
            <Input
              className="h-12 mb-2"
              value={
                [position?.lat, position?.lng].filter(Boolean).join(", ") || "[Chưa có toạ độ]"
              }
              readOnly
            />

            <GoogleMap
              mapContainerStyle={{
                border: "1px solid #ddd",
                borderRadius: "4px",
                height: "350px",
              }}
              center={position}
              zoom={18}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControl: false,
              }}
              onDrag={() => {
                const center = map.getCenter();
                setMarkerPosition({
                  lat: center.lat(),
                  lng: center.lng(),
                });
              }}
              onDragEnd={() => {
                const center = map.getCenter();
                setPosition({
                  lat: center.lat(),
                  lng: center.lng(),
                });
              }}
            >
              <Marker position={markerPosition} />
            </GoogleMap>
          </div>
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <Button
          primary
          className="h-12 px-8 mx-auto mb-4"
          text="Chọn toạ độ được đánh dấu"
          disabled={!position?.lat || !position?.lng}
          onClick={() => {
            const { lat, lng } = position;
            onSelectLocation({ latitude: lat, longitude: lng });
            props.onClose();
          }}
        />
      </Dialog.Footer>
    </Dialog>
  );
}
