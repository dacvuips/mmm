import { ChangeEvent, useEffect, useRef, useState } from "react";
import { uploadImage } from "../../../../lib/helpers/image";
import { useToast } from "../../../../lib/providers/toast-provider";

interface PropsType extends ReactProps {
  onUploadingChange?: (uploading: boolean) => any;
  onImageUploaded: (images: string[]) => any;
  onRef: any;
}

export function UploadImages({ onRef, onUploadingChange, onImageUploaded, ...props }: PropsType) {
  const ref = useRef<HTMLInputElement>();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  let [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    onRef(() => ({
      onClick,
    }));
  }, []);

  useEffect(() => {
    onUploadingChange(uploading);
  }, [uploading]);

  const onClick = () => {
    ref.current.click();
  };

  const onFileChanged = async (e: ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    try {
      setUploading(true);
      let tasks = [];
      for (let i = 0; i < files.length; i++) {
        tasks.push(
          uploadImage(files.item(i))
            .then((res) => {
              values.push(res.link);
              setValues([...values]);
            })
            .catch((err) => {
              console.error(err);
              toast.error(`Upload ảnh thất bại`);
            })
        );
      }
      await Promise.all(tasks);
      if (onImageUploaded) onImageUploaded(values);
    } catch (err) {
      console.error(err);
      toast.error(`Upload ảnh thất bại`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <input multiple hidden type="file" accept="image/*" ref={ref} onChange={onFileChanged} />
    </>
  );
}
