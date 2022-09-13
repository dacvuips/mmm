import { MutableRefObject, useEffect, useRef, useState } from "react";
import { CgSpinner } from "react-icons/cg";

export interface EditorProps extends FormControlProps {
  minHeight?: string;
  maxHeight?: string;
  maxWidth?: string;
  noBorder?: boolean;
}
export function Editor({
  controlClassName = "form-control",
  className = "flex justify-center px-0 bg-gray-100",
  maxWidth = "960px",
  minHeight = "128px",
  maxHeight = "none",
  style = {},
  ...props
}: EditorProps) {
  const [value, setValue] = useState<any>(props.value);
  const [editor, setEditor] = useState<any>();

  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value || getDefaultValue({}));
    } else {
      setValue(getDefaultValue({}));
    }
  }, [props.value]);

  const editorRef: MutableRefObject<any> = useRef();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor, InlineEditor } = editorRef.current || {};

  useEffect(() => {
    editorRef.current = {
      CKEditor: require("@ckeditor/ckeditor5-react").CKEditor,
      InlineEditor: require("@mcom_solutions/ckeditor5-build"),
    };
    setEditorLoaded(true);
  }, []);

  const onChange = (data) => {
    setValue(data);
    if (props.onChange) props.onChange(data);
  };

  useEffect(() => {
    if (editor) {
      editor.editing.view.change((writer) => {
        writer.setStyle("min-height", minHeight, editor.editing.view.document.getRoot());
        writer.setStyle("max-height", maxHeight, editor.editing.view.document.getRoot());
        writer.setStyle("max-width", maxWidth, editor.editing.view.document.getRoot());
        writer.setStyle("width", "100%", editor.editing.view.document.getRoot());
        writer.setStyle("border-radius", "inherit", editor.editing.view.document.getRoot());
        writer.setStyle(
          "background-color",
          props.readOnly ? "transparent" : "white",
          editor.editing.view.document.getRoot()
        );
        if (props.noBorder) {
          writer.setStyle("border", "0 !important", editor.editing.view.document.getRoot());
          writer.setStyle("box-shadow", "none !important", editor.editing.view.document.getRoot());
        } else {
          writer.setStyle(
            "box-shadow",
            "0 0 4px 1px rgba(0, 0, 0, 0.08)",
            editor.editing.view.document.getRoot()
          );
        }
      });
      editor.isReadOnly = props.readOnly;
    }
  }, [props.readOnly, minHeight, maxHeight, editor]);

  return (
    <>
      {editorLoaded ? (
        <div
          className={`${controlClassName} ${props.readOnly ? "readOnly" : ""} ${
            props.error ? "error" : ""
          } ${className}`}
          style={{ ...style }}
        >
          <CKEditor
            editor={InlineEditor}
            data={value}
            config={{
              placeholder: props.placeholder,
              tabindex: "-1",
              mediaEmbed: {
                previewsInData: true,
              },
              extraPlugins: [UploadAdapterPlugin],
            }}
            // onChange={(event, editor) => {
            //   onChange(editor.getData());
            // }}
            onBlur={(event, editor) => {
              onChange(editor.getData());
            }}
            onReady={(editor) => {
              setEditor(editor);
            }}
          />
        </div>
      ) : (
        <div className="form-checkbox col-span-12 pt-1.5">
          <i className="self-start pt-0 animate-spin">
            <CgSpinner />
          </i>
          <span className="pl-1.5 loading-ellipsis text-base">Đang tải</span>
        </div>
      )}
    </>
  );
}

const getDefaultValue = (props: EditorProps) => {
  return "";
};

Editor.getDefaultValue = getDefaultValue;

function UploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    // Configure the URL to the upload script in your back-end here!
    return new MyUploadAdapter(loader);
  };
}

class MyUploadAdapter {
  xhr: XMLHttpRequest;
  loader: any;

  constructor(loader) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          this._initRequest();
          this._initListeners(resolve, reject, file);
          this._sendRequest(file);
        })
    );
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  // Initializes the XMLHttpRequest object using the URL passed to the constructor.
  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());

    // Note that your request may look different. It is up to you and your editor
    // integration to choose the right communication channel. This example uses
    // a POST request with JSON as a data structure but your configuration
    // could be different.
    xhr.open("POST", "https://api.imgur.com/3/image", true);
    xhr.setRequestHeader("Authorization", "Client-ID dd32dd3c6aaa9a0");
    xhr.responseType = "json";
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners(resolve, reject, file) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Tải ảnh thất bại: ${file.name}.`;

    xhr.addEventListener("error", () => {
      reject(genericErrorText);
    });

    xhr.addEventListener("abort", () => reject());
    xhr.addEventListener("load", () => {
      const response = xhr.response;

      // This example assumes the XHR server's "response" object will come with
      // an "error" which has its own "message" that can be passed to reject()
      // in the upload promise.
      //
      // Your integration may handle upload errors in a different way so make sure
      // it is done properly. The reject() function must be called when the upload fails.
      if (!response || response.error || !response.success) {
        return reject(
          response
            ? response.error
              ? response.error.message
              : response.data?.error
            : genericErrorText
        );
      }

      // If the upload is successful, resolve the upload promise with an object containing
      // at least the "default" URL, pointing to the image on the server.
      // This URL will be used to display the image in the content. Learn more in the
      // UploadAdapter#upload documentation.
      resolve({
        default: response.data?.link,
      });
    });

    // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
    // properties which are used e.g. to display the upload progress bar in the editor
    // user interface.
    if (xhr.upload) {
      xhr.upload.addEventListener("progress", (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  // Prepares the data and sends the request.
  _sendRequest(file) {
    // Prepare the form data.
    const data = new FormData();

    data.append("image", file);

    // Important note: This is the right place to implement security mechanisms
    // like authentication and CSRF protection. For instance, you can use
    // XMLHttpRequest.setRequestHeader() to set the request headers containing
    // the CSRF token generated earlier by your application.

    // Send the request.
    this.xhr.send(data);
  }
}
