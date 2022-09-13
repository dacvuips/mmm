import axios from "axios";
import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { HiCheck, HiCheckCircle, HiCloudUpload, HiX } from "react-icons/hi";
import { useShopLayoutContext } from "../../../../layouts/shop-layout/providers/shop-layout-provider";
import { GetMemberToken } from "../../../../lib/graphql/auth.link";
import { useAlert } from "../../../../lib/providers/alert-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { DOMAIN_STATUS, ShopConfigService } from "../../../../lib/repo/shop-config.repo";
import { Dialog, DialogProps } from "../../../shared/utilities/dialog/dialog";
import { Button, Field, Form, Input, Label, Switch } from "../../../shared/utilities/form";
import { NotFound } from "../../../shared/utilities/misc";
export function DomainSettings() {
  const { shopConfig, updateShopConfig } = useShopLayoutContext();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [openRegisterDomain, setOpenRegisterDomain] = useState(false);
  const { staffPermission } = useAuth();
  const disabled = !staffPermission("WRITE_SETTINGS");
  // const [status, setStatus] = useState<Option>();
  const onSubmit = async (data) => {
    try {
      await updateShopConfig({ domainConfig: { active: data.active } });
    } catch (error) {
      toast.error("Đã xảy ra lỗi " + error);
    } finally {
      setSubmitting(false);
    }
  };
  const cancelDomainCongfig = async () => {
    try {
      await ShopConfigService.cancelShopDomain();
      await loadShopData();
    } catch (error) {
      toast.error("Đã xảy ra lỗi " + error);
    } finally {
      setSubmitting(false);
    }
  };
  const loadShopData = async () => {
    setSubmitting(true);
    try {
      await updateShopConfig({ domainConfig: { active: false } });
    } catch (error) {
      toast.error("Đã xảy ra lỗi " + error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Form
        grid
        defaultValues={shopConfig.domainConfig}
        className="max-w-screen-sm animate-emerge"
        onSubmit={onSubmit}
      >
        <Form.Title className="pt-3" title="Cấu hình Tên miền" />
        {shopConfig.domainConfig.hostName ? (
          <div className="flex items-center gap-4 col-span-full">
            <Field label="Tên miền đã tạo" name="hostName" readOnly className="min-w-sm">
              <Input className="" />
            </Field>
            <Field label="" name="active" className="mt-auto mb-0">
              <Switch className="" placeholder="Bật tên miền" />
            </Field>
          </div>
        ) : (
          <NotFound text="Chưa liên kết tên miền" className="col-span-full" />
        )}
        <div className="flex items-center justify-between col-span-12 mb-4">
          <DomainStatus />
          {shopConfig.domainConfig.status == "connected" ? (
            <Button
              outline
              hoverDanger
              className="bg-white rounded-full"
              text="Hủy kết nối tên miền"
              onClick={cancelDomainCongfig}
            />
          ) : (
            <Button
              info
              className="rounded-full"
              text="Kết nối tên miền"
              onClick={() => setOpenRegisterDomain(true)}
            />
          )}
        </div>

        <Form.Footer
          className="mt-1"
          isReverse={false}
          submitProps={{ large: true, className: "shadow", disabled }}
        />
      </Form>
      <DomainSettingFormSteps
        width="700px"
        slideFromBottom="none"
        extraBodyClass="overflow-hidden rounded-md"
        isOpen={openRegisterDomain}
        onClose={() => {
          loadShopData();
          setOpenRegisterDomain(false);
        }}
      />
    </>
  );
}

function DomainStatus() {
  const { shopConfig } = useShopLayoutContext();
  const status = DOMAIN_STATUS.find((x) => x.value == shopConfig.domainConfig.status);

  return (
    <div>
      <Label text="Trạng thái kết nối tên miền" />
      <span className="flex items-center ml-1 font-semibold text-gray-700">
        <div className={`w-2.5 h-2.5 mr-2 rounded-full bg-${status?.color}`}></div>
        <span className={`text-${status?.color}`}>{status?.label}</span>
      </span>
    </div>
  );
}

function DomainSettingFormSteps(props: DialogProps) {
  const toast = useToast();
  const [step, setStep] = useState<"NEWDOMAIN" | "ADDFILE" | "COMPLETE">("COMPLETE");
  const [data, setData] = useState<{
    hostName: string;
    certificate: File;
    certificateKey: File;
    intermediateCertificate: File;
  }>(null);

  const configDomain = async (data: {
    hostName: string;
    certificate: File;
    certificateKey: File;
    intermediateCertificate: File;
  }) => {
    const { hostName, certificate, certificateKey, intermediateCertificate } = data;
    const formData = new FormData();
    formData.append("hostName", hostName);
    formData.append("certificate", certificate);
    formData.append("certificateKey", certificateKey);
    formData.append("intermediateCertificate", intermediateCertificate);
    return await axios
      .post("/api/shopConfig/setUpDomain", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-token": GetMemberToken(),
        },
      })
      .then((res) => res.data)
      .catch((err) => {
        throw err.response.data;
      });
  };
  const resgisDomain = async () => {
    try {
      await configDomain(data);
      toast.success("Kết nối tên miền thành công");
      setStep("COMPLETE");
    } catch (error) {
      console.error(error);
      toast.error(
        "Lỗi kết nối tên miền. " +
        ((error.message as string).includes("is already in use")
          ? "Tên miền đang bị sử dụng"
          : error.message)
      );
    }
  };
  return (
    <Dialog {...props}>
      <div className="overflow-hidden bg-white rounded-md">
        <div className="flex flex-col h-32 justify-evenly bg-info">
          <strong className="p-4 text-white uppercase">Thêm tên miền</strong>
          <div className="flex p-4">
            {steps.map((item, index) => (
              <div className="flex items-center flex-1 gap-2 font-semibold">
                <div
                  className={`${step == item.value ? "bg-white " : "bg-info-dark text-white"
                    } w-6 h-6 text-center rounded-full`}
                >
                  {index + 1}
                </div>
                <div className="text-white">{item.label}</div>
                {index < steps.length - 1 && <hr className="flex-1 mr-2 border-white" />}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">
          {
            {
              NEWDOMAIN: (
                <div>
                  <p>
                    Nhập chính xác tên miền mà bạn muốn liên kết, người dùng sẽ dùng tên miền này để
                    truy cập đến chính xác trang cửa hàng của bạn. Nó có thể là tên miền
                    (cuahang.com) hoặc tên miền phụ (cuahang.cuaban.com)
                  </p>
                  <Label text="Tên miền của bạn" />
                  <Input
                    value={data?.hostName}
                    placeholder="yourdomain.com"
                    onChange={(val) => setData({ ...data, hostName: val })}
                    type="url"
                  />
                </div>
              ),
              ADDFILE: (
                <AddFile
                  certificate={data?.certificate}
                  certificateKey={data?.certificateKey}
                  intermediateCertificate={data?.intermediateCertificate}
                  onChangCertificate={(certificate) => setData({ ...data, certificate })}
                  onChangCertificateKey={(certificateKey) => setData({ ...data, certificateKey })}
                  onChangIntermediateCertificate={(intermediateCertificate) =>
                    setData({ ...data, intermediateCertificate })
                  }
                />
              ),
              COMPLETE: (
                <div className="py-6">
                  <div className="flex items-center text-xl text-gray-700 font-semibold justify-center">
                    <i className="text-success text-4xl mr-2">
                      <HiCheckCircle />
                    </i>
                    Đăng ký tên miền thành công
                  </div>
                  <table className="w-5/6 py-4 mx-auto border-l border-r border-gray-600 table-auto mt-8">
                    <thead>
                      <tr className="h-10 border-t border-b">
                        <th className="px-4 text-left">Type</th>
                        <th className="px-4 text-center">Host</th>
                        <th className="px-4 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="h-10 border-b">
                        <td className="px-4 text-left">A</td>
                        <td className="px-4 text-center">{data?.hostName}</td>
                        <td className="px-4 text-right">18.141.254.148</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ),
            }[step]
          }
        </div>
        <div className="flex p-4">
          {step !== "COMPLETE" && (
            <>
              <Button
                text={"Trở lại"}
                className="ml-0 mr-auto"
                disabled={step !== "ADDFILE"}
                outline
                onClick={() => setStep("NEWDOMAIN")}
              ></Button>
              <Button
                text={"Hủy"}
                className="ml-auto mr-0"
                outline
                onClick={props.onClose}
              ></Button>
            </>
          )}
          {
            {
              NEWDOMAIN: (
                <Button
                  text={"Tiếp tục"}
                  info
                  disabled={!data?.hostName}
                  className="ml-4 mr-0"
                  onClick={() => {
                    setStep("ADDFILE");
                  }}
                ></Button>
              ),
              ADDFILE: (
                <Button
                  disabled={
                    !data?.certificate || !data?.certificateKey || !data?.intermediateCertificate
                  }
                  text={"Xác nhận"}
                  info
                  className="ml-4 mr-0"
                  onClick={resgisDomain}
                ></Button>
              ),
              COMPLETE: (
                <Button
                  text={"Hoàn thành"}
                  info
                  className="ml-auto mr-0"
                  onClick={() => {
                    setData(null);
                    setStep("NEWDOMAIN");
                    props.onClose();
                  }}
                ></Button>
              ),
            }[step]
          }
        </div>
      </div>
    </Dialog>
  );
}
function AddFile(props: {
  onChangCertificate: (data: File) => void;
  onChangCertificateKey: (data: File) => void;
  onChangIntermediateCertificate: (data: File) => void;
  certificate: File;
  certificateKey: File;
  intermediateCertificate: File;
}) {
  return (
    <div>
      <Form.Title title="Thêm các tệp tin cần thiết" />
      <UpFile
        name="Certificate"
        value={props.certificate}
        onChange={(val) => props.onChangCertificate(val)}
      />
      <UpFile
        name="Certificate Key"
        value={props.certificateKey}
        onChange={(val) => props.onChangCertificateKey(val)}
      />
      <UpFile
        name="Intermediate Certificate"
        value={props.intermediateCertificate}
        onChange={(val) => props.onChangIntermediateCertificate(val)}
      />
    </div>
  );
}
interface FileInputProps extends FormControlProps {
  onChange: (file: File) => void;
  name: string;
}
function UpFile({ name = "", ...props }: FileInputProps) {
  const fileRef: MutableRefObject<HTMLInputElement> = useRef();
  const alert = useAlert();
  const [file, setFile] = useState<File>();
  useEffect(() => {
    if (props.value !== undefined) {
      setFile(props.value);
    }
  }, [props.value]);
  const onUploadFiles = async (fileList: FileList) => {
    if (fileList.length) {
      const file = fileList.item(0);
      setFile(file);
      props.onChange(file);
    } else {
      setFile(null);
      props.onChange(null);
    }
  };
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    let fileList = e.target.files;
    onUploadFiles(fileList);
    e.target.value = null;
  };
  return (
    <div className="mb-4">
      <Label text={name} />
      {file ? (
        <div className="flex items-center border border-gray-300 rounded bg-white">
          <a
            className="flex-1 pl-2 font-semibold text-gray-700 truncate cursor-pointer hover:text-primary hover:underline"
            data-tooltip={file.name}
            target="_blank"
            download
          >
            {file.name}
          </a>
          <div className="ml-auto text-sm px-2 text-gray-500 border-r border-gray-300">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </div>
          <Button
            hoverDanger
            unfocusable
            className="px-3"
            icon={<HiX />}
            onClick={async () => {
              let res = await alert.warn("Xóa tệp", "Tệp này sẽ bị xóa!");
              if (res) {
                setFile(undefined);
                props.onChange(null);
              }
            }}
          />
        </div>
      ) : (
        <Button
          outline
          className="bg-white px-16"
          icon={<HiCloudUpload />}
          text={`Upload file `}
          onClick={() => fileRef.current?.click()}
        />
      )}

      <input type="file" onChange={onFileChange} hidden ref={fileRef} />
    </div>
  );
}
const steps = [
  {
    value: "NEWDOMAIN",
    label: "Tạo tên miền",
  },
  {
    value: "ADDFILE",
    label: "Thêm tệp",
  },
  {
    value: "COMPLETE",
    label: "Hoàn thành",
  },
];
