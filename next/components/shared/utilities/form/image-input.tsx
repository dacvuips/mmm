import { isEqual } from "lodash";
import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCloseLine,
  RiStarLine,
  RiUpload2Line,
} from "react-icons/ri";
import { uploadImage } from "../../../../lib/helpers/image";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Img } from "../misc/img";
import { Button } from "./button";

export interface ImageInputProps extends FormControlProps {
  multi?: boolean;
  inputClassName?: string;
  imgUrlClassName?: string;
  buttonClassName?: string;
  avatar?: boolean;
  largeImage?: boolean;
  ratio169?: boolean;
  percent?: number;
  contain?: boolean;
  cover?: boolean;
  checkerboard?: boolean;
  cols?: Cols;
  compress?: number;
  hasFirstImage?: boolean | string;
  noImage?: boolean;
}
export function ImageInput({
  controlClassName = "form-control",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  imgUrlClassName = "",
  hasFirstImage = false,
  style = {},
  multi = false,
  noImage = false,
  ...props
}: ImageInputProps) {
  const [value, setValue] = useState<string | string[]>();
  const [url, setUrl] = useState("");
  const ref: MutableRefObject<HTMLInputElement> = useRef();
  const [uploading, setUploading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (!isEqual(props.value, value)) {
      if (props.value !== undefined) {
        setValue(props.value || getDefaultValue({ multi }));
      } else {
        setValue(getDefaultValue({ multi }));
      }
    }
  }, [props.value]);

  const onFileChanged = async (e: ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (files.length == 0) return;

    if (multi) {
      try {
        setUploading(true);
        let tasks = [];
        for (let i = 0; i < files.length; i++) {
          tasks.push(uploadImage(files.item(i)));
        }
        let res = await Promise.all(tasks);
        let images = res.map((x) => x.link);
        const newImages = [...(value as string[]), ...images];
        setValue(newImages);
        if (props.onChange) props.onChange(newImages);
      } catch (err) {
        console.error(err);
        toast.error(`Upload ảnh thất bại. Xin thử lại bằng url thay vì upload.`);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    } else {
      let file = files[0];
      try {
        setUploading(true);
        let res = await uploadImage(file);
        setValue(res.link);
        if (props.onChange) props.onChange(res.link);
      } catch (err) {
        console.error(err);
        toast.error(`Upload ảnh thất bại. Xin thử lại bằng url thay vì upload.`);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    }
  };

  const onAddImage = () => {
    if (url) {
      let newValue = value.concat(url);
      setValue(newValue);
      setUrl("");
      if (props.onChange) props.onChange(newValue);
    } else {
      alert("Yêu cầu nhập đường dẫn ảnh");
    }
  };

  return (
    <>
      {multi ? (
        <>
          {!!value?.length && (
            <div className={`grid mb-2 gap-3 grid-cols-${props.cols || 4}`}>
              {(value as string[]).map((image, index) => (
                <Img
                  compress={props.compress || 200}
                  key={index}
                  className="border border-gray-400 group"
                  showImageOnClick
                  contain={props.contain || !props.cover}
                  checkerboard={props.checkerboard}
                  ratio169={props.ratio169}
                  percent={props.percent}
                  src={image}
                  avatar={props.avatar}
                  lazyload={false}
                >
                  {index != 0 && (
                    <Button
                      outline
                      primary
                      className="absolute w-8 h-8 px-0 bg-white rounded-full opacity-0 -left-2 -bottom-1 group-hover:opacity-100"
                      icon={<RiArrowLeftLine />}
                      onClick={() => {
                        let newValue = [...(value as string[])];
                        let temp = newValue[index - 1];
                        newValue[index - 1] = newValue[index];
                        newValue[index] = temp;
                        setValue(newValue);
                        if (props.onChange) props.onChange(newValue);
                      }}
                    />
                  )}
                  <Button
                    outline
                    danger
                    className="absolute w-8 h-8 px-0 transform -translate-x-1/2 bg-white rounded-full opacity-0 left-1/2 -bottom-1 group-hover:opacity-100"
                    icon={<RiCloseLine />}
                    onClick={() => {
                      (value as string[]).splice(index, 1);
                      let newValue = [...(value as string[])];
                      setValue(newValue);
                      if (props.onChange) props.onChange(newValue);
                    }}
                  />
                  {index != value.length - 1 && (
                    <Button
                      outline
                      primary
                      className="absolute w-8 h-8 px-0 bg-white rounded-full opacity-0 -right-2 -bottom-1 group-hover:opacity-100"
                      icon={<RiArrowRightLine />}
                      onClick={() => {
                        let newValue = [...(value as string[])];
                        let temp = newValue[index + 1];
                        newValue[index + 1] = newValue[index];
                        newValue[index] = temp;
                        setValue(newValue);
                        if (props.onChange) props.onChange(newValue);
                      }}
                    />
                  )}
                  {hasFirstImage && index == 0 && (
                    <i
                      className="absolute p-2 bg-white border rounded-full -top-2 -right-2 text-primary border-primary"
                      data-tooltip={hasFirstImage || "Ảnh đại diện"}
                    >
                      <RiStarLine />
                    </i>
                  )}
                </Img>
              ))}
            </div>
          )}
          <div className={`flex items-center ${imgUrlClassName}`}>
            <input
              tabIndex={props.noFocus && -1}
              className={`${controlClassName} mt-0 flex-1 rounded-r-none ${inputClassName || ""}`}
              placeholder={props.placeholder || "Nhập đường dẫn ảnh"}
              readOnly={props.readOnly}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  e.preventDefault();
                  onAddImage();
                }
              }}
            />
            <Button
              outline
              className={`grow-0 shrink-0 rounded-l-none px-3 bg-white ${buttonClassName}`}
              text="Thêm ảnh"
              unfocusable
              disabled={props.readOnly}
              onClick={() => {
                onAddImage();
              }}
            />
            <span className="px-2 font-semibold">hoặc</span>
            <Button
              outline
              className={`grow-0 shrink-0 px-3 bg-white ${buttonClassName}`}
              icon={<RiUpload2Line />}
              text="Upload"
              unfocusable
              disabled={props.readOnly}
              isLoading={uploading}
              onClick={() => ref.current?.click()}
            />
            <input
              hidden
              multiple
              type="file"
              accept="image/*"
              ref={ref}
              onChange={onFileChanged}
            />
          </div>
        </>
      ) : (
        <>
          {props.largeImage && (
            <Img
              compress={props.compress || 400}
              className="w-full bg-gray-100 border border-b-0 border-gray-400 rounded-t"
              showImageOnClick
              contain={props.contain || !props.cover}
              checkerboard={props.checkerboard}
              ratio169={props.ratio169}
              percent={props.percent}
              src={(value as string) || ""}
              avatar={props.avatar}
              lazyload={false}
            />
          )}

          <div
            className={`${controlClassName} mt-0 relative flex items-center focus-within:border-primary-dark group px-0 ${props.readOnly ? "readOnly" : ""
              } ${props.error ? "error" : ""} ${props.largeImage ? "rounded-t-none" : ""
              } ${className}`}
            style={{ ...style }}
          >
            {!noImage && !props.largeImage && (
              <Img
                compress={props.compress || 80}
                contain={props.contain}
                className="self-stretch shrink-0 w-10 p-1"
                src={(value as string) || ""}
                avatar={props.avatar}
                showImageOnClick
                lazyload={false}
              />
            )}
            <input
              tabIndex={props.noFocus && -1}
              className={`flex-grow bg-transparent self-stretch ${props.largeImage ? "px-3" : "px-1.5"
                } ${inputClassName || ""}`}
              name={props.name}
              value={value || ""}
              placeholder={props.placeholder}
              readOnly={props.readOnly}
              onChange={(e) => {
                setValue(e.target.value);
                if (props.onChange) props.onChange(e.target.value);
              }}
            />
            {!props.readOnly && (
              <Button
                className={`border-l self-stretch rounded-l-none border-gray-300 bg-gray-50 px-3 ${buttonClassName}`}
                isLoading={uploading}
                tooltip="Upload"
                icon={<RiUpload2Line />}
                unfocusable
                onClick={() => ref.current?.click()}
              ></Button>
            )}
            <input hidden type="file" accept="image/*" ref={ref} onChange={onFileChanged} />
          </div>
        </>
      )}
    </>
  );
}

const getDefaultValue = (props: ImageInputProps) => {
  return props.multi ? [] : "";
};

ImageInput.getDefaultValue = getDefaultValue;
