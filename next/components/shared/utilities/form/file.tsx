import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import { FileDrop } from "react-file-drop";
import { HiCloudUpload, HiX } from "react-icons/hi";
import { useToast } from "../../../../lib/providers/toast-provider";
import { Button } from ".";
import { Attachment, AttachmentService } from "../../../../lib/repo/attachment.repo";

export interface FileInputProps extends FormControlProps {
  multi?: boolean;
  acceptImage?: boolean;
  acceptDocs?: boolean;
  accept?: string;
  maxSize?: number; //MB
  uploadPromise?: (files: File) => Promise<Attachment>;
  getFilesPromise?: (ids?: string[]) => Promise<Attachment[]>;
}
export function FileInput({
  multi = false,
  controlClassName = "form-control",
  className = "",
  defaultValue,
  style = {},
  maxSize = 5,
  uploadPromise = (file) => AttachmentService.uploadFile(file),
  getFilesPromise = (ids) => AttachmentService.getFilesPromise(ids),
  placeholder,
  ...props
}: FileInputProps) {
  const [value, setValue] = useState<string | string[]>();
  const [files, setFiles] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadDone, setLoadDone] = useState(false);
  const fileRef: MutableRefObject<HTMLInputElement> = useRef();
  const toast = useToast();

  let accept = props.accept || "";
  if (!accept) {
    if (props.acceptImage) {
      accept = "image/png, image/jpeg";
    } else if (props.acceptDocs) {
      accept =
        ".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
  }

  useEffect(() => {
    if (value !== undefined) {
      if (!loadDone && ((multi && value?.length) || (!multi && value))) {
        getFilesPromise(multi ? (value as string[]) : [value as string]).then((res) => {
          setFiles(res);
          setLoadDone(true);
        });
      } else {
        setLoadDone(true);
      }
    }
  }, [value, loadDone]);

  useEffect(() => {
    if (loadDone) {
      if (multi) {
        onChange(files.map((x) => x.id));
      } else {
        onChange(files.length ? files[0].id : null);
      }
    }
  }, [loadDone, files]);

  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value || defaultValue || getDefaultValue({ multi }));
    } else {
      setValue(defaultValue || getDefaultValue({ multi }));
    }
  }, [props.value]);

  const onChange = (data) => {
    setValue(data);
    if (props.onChange) props.onChange(data);
  };

  const onUploadFiles = async (fileList: FileList) => {
    if (fileList.length) {
      if (maxSize) {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList.item(0);
          if (file.size / (1024 * 1024) > maxSize) {
            toast.info(`Kích thước file tối đa ${maxSize}MB`);
            return;
          }
        }

        setLoading(true);
        let tasks = [];
        let attachments: Attachment[] = [];
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList.item(0);
          tasks.push(
            uploadPromise(file)
              .then((res) => {
                attachments[i] = { ...res };
              })
              .catch((err) => {
                attachments[i] = null;
                toast.error(`Upload file "${file.name}" thất bại`);
              })
          );
          if (!multi) break;
        }
        await Promise.allSettled(tasks);
        setLoading(false);
        setFiles([...files, ...attachments.filter(Boolean)]);
      }
    }
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    let fileList = e.target.files;
    onUploadFiles(fileList);
    e.target.value = null;
  };

  const onDrop = (files: FileList) => {
    onUploadFiles(files);
  };

  return (
    <FileDrop
      className={`${controlClassName} file-drop px-0 focus-within:border-primary-dark ${
        props.readOnly ? "readOnly" : ""
      } ${props.error ? "error" : ""} ${className}`}
      onDrop={onDrop}
    >
      <input multiple={!!multi} ref={fileRef} type="file" hidden accept={accept} onChange={onFileChange} />
      {!loadDone ? (
        <Button isLoading={true} text="Đang tải..." className="w-full" />
      ) : (
        <>
          {files.length
            ? files.map((file, index) => (
                <div key={file.id} className="flex items-center border-b border-gray-200">
                  <a
                    className="flex-1 pl-2 font-semibold text-gray-700 truncate cursor-pointer hover:text-primary hover:underline"
                    data-tooltip={file.name}
                    href={file.downloadUrl}
                    target="_blank"
                    download
                  >
                    {file.name}
                  </a>
                  <div className="ml-auto text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  <Button
                    hoverDarken
                    unfocusable
                    className="px-3 ml-2 border-l border-gray-100 rounded-l-none hover:border-gray-200"
                    icon={<HiX />}
                    onClick={() => {
                      files.splice(index, 1);
                      setFiles([...files]);
                    }}
                  />
                </div>
              ))
            : null}
          {multi || (!multi && !files.length) ? (
            <Button
              hoverDarken
              className={`btn-upload w-full no-focus`}
              icon={<HiCloudUpload />}
              text={placeholder || `Upload file (tối đa ${maxSize}MB)`}
              isLoading={loading}
              onClick={() => fileRef.current?.click()}
              disabled={props.readOnly}
            />
          ) : null}
        </>
      )}
    </FileDrop>
  );
}

const getDefaultValue = (props: FileInputProps) => {
  return props.multi ? [] : null;
};

FileInput.getDefaultValue = getDefaultValue;
