import { useEffect, useState } from "react";
import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
import { RiMapPinLine } from "react-icons/ri";
import { GOOGLE_MAPS_API_KEY } from "../../../lib/constants/google.const";
import { useDevice } from "../../../lib/hooks/useDevice";
import { DialogHeader } from "../default-layout/dialog-header";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";
import { Input } from "../utilities/form/input";
import { NotFound, Spinner } from "../utilities/misc";

interface Props extends DialogProps {
  fullAddress: string;
  onChange: (data: { name: string; fullAddress: string; lng: number; lat: number }) => void;
}
export function AddressGoogleDialog({ onChange, fullAddress = "", ...props }: Props) {
  let [addressText, setAddressText] = useState<string>();
  const [place, setPlace] = useState<google.maps.places.AutocompletePrediction>();
  const { isDesktop } = useDevice();

  useEffect(() => {
    if (place) {
      placesService.getDetails(
        { placeId: place.place_id, fields: ["formatted_address", "geometry"] },
        (result) => {
          onChange({
            name: result.name,
            fullAddress: result.formatted_address,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          });
        }
      );
    }
  }, [place]);

  useEffect(() => {
    if (props.isOpen) {
      setAddressText(fullAddress);
      if (!placePredictions.length) {
        getPlacePredictions({
          input: fullAddress,
          componentRestrictions: { country: "vn" },
        });
      }
    }
  }, [props.isOpen]);

  const {
    placesService,
    placePredictions,
    getPlacePredictions,
    isPlacePredictionsLoading,
  } = usePlacesService({
    apiKey: GOOGLE_MAPS_API_KEY,
    language: "vi",
  });

  return (
    <Dialog width={600} {...props} headerClass=" " extraDialogClass="rounded-t-3xl lg:rounded-t">
      <DialogHeader title="Giao đến" onClose={props.onClose} />
      <div
        className="bg-white no-scrollbar"
        style={{
          minHeight: `${isDesktop ? "600px" : ""} `,
          height: `${isDesktop ? "auto" : " calc(100vh - 144px)"} `,
        }}
      >
        <div className="sticky top-0 p-4 bg-gray-100">
          <Input
            prefix={<RiMapPinLine />}
            prefixClassName="text-xl"
            autoFocus
            className="h-14 rounded-xl border border-gray-300"
            debounce
            clearable
            name="address"
            placeholder="Tìm địa chỉ giao hàng tại đây"
            value={addressText}
            onChange={(val) => {
              if (val !== addressText) {
                setAddressText(val);
                getPlacePredictions({
                  input: val,
                  componentRestrictions: { country: "vn" },
                });
              }
            }}
          />
        </div>
        {!addressText ? (
          <NotFound icon={<RiMapPinLine />} text="Nhập địa chỉ để tìm kiếm địa điểm giao hàng" />
        ) : (
          <>
            {isPlacePredictionsLoading && <Spinner />}
            {!isPlacePredictionsLoading && placePredictions && (
              <>
                {placePredictions.length ? (
                  <>
                    {placePredictions.map((place) => (
                      <button
                        type="button"
                        key={place.place_id}
                        className="flex items-start w-full p-4 text-gray-600 border-b border-gray-200 animate-emerge hover:bg-primary-light"
                        onClick={async () => {
                          setPlace(place);
                        }}
                      >
                        {/* <i className="mt-1 mr-2 text-xl">
                          <RiMapPinLine />
                        </i> */}
                        <div className="text-left">
                          <div className="text-lg font-semibold text-primary">
                            {place.structured_formatting.main_text}
                          </div>
                          <div>{place.structured_formatting.secondary_text}</div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <NotFound text="Không tìm thấy địa chỉ" />
                )}
              </>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}
