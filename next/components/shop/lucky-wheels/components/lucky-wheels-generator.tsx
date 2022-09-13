import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { useEffect, useRef, useState } from "react";
import {
  RiAddCircleLine,
  RiArrowUpDownLine,
  RiFullscreenLine,
  RiGiftLine,
  RiPaletteLine,
  RiShuffleFill,
} from "react-icons/ri";
import * as Winwheel from "winwheel";
import copy from "copy-to-clipboard";
import { useAlert } from "../../../../lib/providers/alert-provider";
import { useToast } from "../../../../lib/providers/toast-provider";
import { DesignConfig, LuckyWheel, LuckyWheelService } from "../../../../lib/repo/lucky-wheel.repo";
import { Dialog } from "../../../shared/utilities/dialog/dialog";
import {
  Button,
  Checkbox,
  Field,
  FormProps,
  ImageInput,
  Input,
  Select,
} from "../../../shared/utilities/form";
import { Spinner } from "../../../shared/utilities/misc";
import { uploadImage } from "../../../../lib/helpers/image";

const NULL = "∅";
interface PropsType extends FormProps {
  luckyWheel: LuckyWheel;
  onWheelChange: (wheel: Partial<LuckyWheel>) => any;
}
export function LuckyWheelGenerator({ luckyWheel, onWheelChange, ...props }: PropsType) {
  const [designConfig, setDesignConfig] = useState<Partial<DesignConfig>>();
  const [palettes, setPalettes] = useState<string[]>();
  const [schemePalettes, setSchemePalettes] = useState<string[]>();
  const [winWheel, setWinWheel] = useState<any>();
  const [loadingWheel, setLoadingWheel] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [hasInitGifts, setHasInitGifts] = useState(false);
  let [fontFamilies, setFontFamilies] = useState<string[]>([]);
  let [initWheelTimeout] = useState<any>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const pinRef = useRef<HTMLCanvasElement>();
  const alert = useAlert();
  const toast = useToast();

  useEffect(() => {
    if (props.isOpen && typeof window !== "undefined") {
      initDesignConfig();
    } else {
      setDesignConfig(null);
      setHasChanged(false);
      setLoadingWheel(false);
      setHasInitGifts(false);
    }
  }, [props.isOpen]);

  useEffect(() => {
    if (designConfig && !hasInitGifts && canvasRef.current && pinRef.current) {
      setTimeout(() => {
        initPalettes();
        initGifts(!designConfig.giftPalettes);
      });
    }
  }, [designConfig, canvasRef.current, pinRef.current]);

  const initDesignConfig = () => {
    const config = cloneDeep(luckyWheel.designConfig) || {};
    config.palette = config.palette || "deepskyblue";
    config.gifts = config.gifts || [];
    config.giftPalettes = config.giftPalettes || [];
    config.hasPin = config.hasPin || false;
    config.imageUrl = config.imageUrl || "";
    config.pinColor = config.pinColor || "";
    config.pinLogo = config.pinLogo || "";
    config.pinUrl = config.pinUrl || "";
    config.textFontFamily = config.textFontFamily || PROPORTIONAL_FONT_FAMILIES[0];
    config.textFontSize = config.textFontSize || 16;
    config.textFontWeight = config.textFontWeight || "bold";
    config.textOrientation = config.textOrientation || "horizontal";
    config.textSplitterSize = config.textSplitterSize || 16;
    config.textAlignment = config.textAlignment || "outer";
    setDesignConfig(config);
  };

  const initPalettes = () => {
    let hsl = GetHSL(designConfig.palette);
    let luminances = [];
    let start = 95,
      end = 20;
    for (let i = start; i >= end; i -= (start - end) / 10) {
      luminances.push(i);
    }

    let tempPalettes = [];
    for (let i = 0; i < luminances.length; i++) {
      tempPalettes.push(HSLtoHex(hsl[0], hsl[1], luminances[i]));
    }
    setPalettes([...tempPalettes]);

    tempPalettes = [];
    let saturation = 85,
      luminance = 55,
      step = 45;
    for (let i = step; i < 360; i += step) {
      tempPalettes.push(HSLtoHex(hsl[0] + i, saturation, luminance));
    }
    setSchemePalettes([...tempPalettes]);
  };

  const initGifts = async (rerollPalette = false) => {
    if (!palettes) return;
    setHasInitGifts(true);
    let hasGiftsChanged = false;

    let gifts = luckyWheel.gifts.map((x) => ({ id: x.id, name: x.name, code: x.code }));
    if (!designConfig.gifts) {
      designConfig.gifts = gifts;
    } else if (!isEqual(designConfig.gifts, gifts)) {
      await LuckyWheelService.update({
        id: luckyWheel.id,
        data: {
          designConfig: { ...designConfig, gifts },
        },
      });
      designConfig.gifts = gifts;
      setDesignConfig({ ...designConfig, gifts });
      alert.info(
        "Danh sách phần thưởng thay đổi",
        "Có sự thay đổi danh sách quà. Thiết lập phần thưởng sẽ thay đổi."
      );
      onWheelChange({ ...luckyWheel, designConfig: { ...designConfig, gifts } });
      hasGiftsChanged = true;
    } else if (designConfig.giftPalettes.find((x) => !x.code)) {
      hasGiftsChanged = true;
    }

    if (hasGiftsChanged) {
      let addedGifts = designConfig.gifts.filter(
        (x) => !designConfig.giftPalettes.find((y) => y.code == (x.code || NULL))
      );
      for (let addedGift of addedGifts) {
        if (!designConfig.giftPalettes.find((x) => x.code == addedGift.code)) {
          designConfig.giftPalettes.push({
            code: addedGift.code || NULL,
            name: addedGift.name.trim(),
            backgroundColor: designConfig.palette,
            color: "black",
          });
        }
      }
      let removedGifts = designConfig.giftPalettes
        .filter((x) => !designConfig.gifts.find((y) => (y.code || NULL) == x.code))
        .map((x) => x.code);
      designConfig.giftPalettes = designConfig.giftPalettes.filter(
        (x) => !removedGifts.includes(x.code)
      );

      let orders = designConfig.gifts
        .map((x) => x.code || NULL)
        .filter((v, i, a) => a.indexOf(v) === i);
      designConfig.giftPalettes = designConfig.giftPalettes.sort((a, b) =>
        orders.findIndex((x) => x == a.code) < orders.findIndex((x) => x == b.code) ? -1 : 1
      );
    }

    let getColorByLuminance = (hsl) =>
      hsl[2] > 65 ? "hsl(" + hsl[0] + "," + (hsl[1] * 80) / 100 + "%," + 30 + "%)" : "white";

    if (
      rerollPalette ||
      !designConfig.giftPalettes?.length ||
      designConfig.giftPalettes.find((x) => !x.code)
    ) {
      if (!designConfig.giftPalettes) {
        designConfig.giftPalettes = [];
      } else {
        designConfig.giftPalettes.forEach((giftPalette) => {
          giftPalette.backgroundColor = "";
        });
      }
      let tempPalettes = [...palettes];
      for (let gift of gifts) {
        let index = Math.floor(Math.random() * tempPalettes.length);
        let hsl = HexToHSL(tempPalettes[index]);
        let giftPalette = designConfig.giftPalettes.find((x) => x.code == (gift.code || NULL));
        if (!giftPalette) {
          designConfig.giftPalettes.push({
            code: gift.code || NULL,
            name: gift.name.trim(),
            backgroundColor: tempPalettes[index],
            color: getColorByLuminance(hsl),
            size: 80,
            offset: 100,
          });
          tempPalettes.splice(index, 1);
        } else if (!giftPalette.backgroundColor) {
          giftPalette.backgroundColor = tempPalettes[index];
          giftPalette.color = getColorByLuminance(hsl);
          tempPalettes.splice(index, 1);
        }
      }
      // LuckyWheelService.update({
      //   id: luckyWheel.id,
      //   data: {
      //     designConfig: { ...designConfig },
      //   },
      // });
    } else {
      for (let giftPalette of designConfig.giftPalettes) {
        let hsl = HexToHSL(giftPalette.backgroundColor);
        giftPalette.color = getColorByLuminance(hsl);
      }
    }
    setDesignConfig({ ...designConfig });
    if (initWheelTimeout) clearTimeout(initWheelTimeout);
    initWheelTimeout = setTimeout(() => {
      initWheel();
    }, 300);
  };

  const initFont = () => {
    if (designConfig.textOrientation == "horizontal") {
      fontFamilies = PROPORTIONAL_FONT_FAMILIES;
      setFontFamilies(PROPORTIONAL_FONT_FAMILIES);
    } else {
      fontFamilies = MONO_FONT_FAMILIES;
      setFontFamilies(MONO_FONT_FAMILIES);
    }
    if (
      !designConfig.textFontFamily ||
      !fontFamilies.find((x) => x == designConfig.textFontFamily)
    ) {
      designConfig.textFontFamily = fontFamilies[0];
    }
  };

  const initWheel = () => {
    setLoadingWheel(true);
    if (winWheel) winWheel.clearCanvas();
    canvasRef.current
      .getContext("2d")
      .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    initFont();
    const WebFont = require("webfontloader");
    WebFont.load({
      google: {
        families: [`${designConfig.textFontFamily}:400,600,700,800:vietnamese`],
      },
      fontactive: (family, fvd) => {
        if (family == designConfig.textFontFamily) {
          drawWheel(canvasRef.current);
          drawWheelDecoration(canvasRef.current);
          drawPin();
          setHasChanged(true);
          setLoadingWheel(false);
        }
      },
    });
  };

  const drawWheelDecoration = (canvas: HTMLCanvasElement) => {
    let ctx = canvas.getContext("2d");
    let center = canvas.width / 2;

    ctx.beginPath();
    ctx.arc(center, center, RADIUS + 2, 0, Math.PI * 2, false); // outer (filled)
    ctx.arc(center, center, RADIUS, 0, Math.PI * 2, true); // outer (unfills it)
    ctx.shadowColor = palettes[9];
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, RADIUS + 24, 0, Math.PI * 2, false); // outer (filled)
    ctx.arc(center, center, RADIUS, 0, Math.PI * 2, true); // outer (unfills it)

    let grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grd.addColorStop(0, palettes[4]);
    grd.addColorStop(0.5, palettes[5]);
    grd.addColorStop(1, palettes[6]);
    ctx.fillStyle = grd;
    ctx.shadowBlur = 4;
    ctx.fill();

    let slices = designConfig.gifts.length;
    let angle = (2 * Math.PI) / slices;
    for (let i = 0; i < slices; i++) {
      let pointX = center + (RADIUS + 12) * Math.cos(angle * i - Math.PI / 2);
      let pointY = center + (RADIUS + 12) * Math.sin(angle * i - Math.PI / 2);

      ctx.beginPath();
      ctx.arc(pointX, pointY, 6, 0, Math.PI * 2, false);
      ctx.fillStyle = palettes[1];
      ctx.shadowColor = palettes[9];
      ctx.shadowBlur = 3;

      ctx.fill();
    }

    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(center, center, RADIUS, 0, Math.PI * 2, false);
    ctx.arc(center, center, RADIUS - 4, 0, Math.PI * 2, true);
    ctx.fillStyle = "white";
    ctx.fill();

    for (let i = 0; i < designConfig.gifts.length; i++) {
      let gift = designConfig.gifts[i];
      let giftPalette = designConfig.giftPalettes.find((x) => x.code == (gift.code || NULL));
      if (giftPalette && giftPalette.image) {
        if (!giftPalette.size) giftPalette.size = 80;
        if (!giftPalette.offset) giftPalette.offset = 100;

        let relativeAngle = -angle * i - Math.PI / 2 - angle / 2;
        let pointX = center + giftPalette.offset * Math.cos(relativeAngle);
        let pointY = center + giftPalette.offset * Math.sin(relativeAngle);
        let image = new Image();
        image.setAttribute("crossOrigin", "anonymous"); //
        image.onload = () => {
          ctx.save();
          ctx.translate(pointX, pointY);
          ctx.rotate(relativeAngle + Math.PI / 2);
          ctx.drawImage(
            image,
            -giftPalette.size / 2,
            -giftPalette.size / 2,
            giftPalette.size,
            giftPalette.size
          );
          ctx.restore();
        };
        image.src = giftPalette.image;
      }
    }
  };

  const drawWheel = (canvas: HTMLCanvasElement) => {
    let center = canvas.width / 2;
    let angle = 360 / designConfig.gifts.length;
    setWinWheel(
      new Winwheel({
        numSegments: designConfig.gifts.length,
        outerRadius: RADIUS,
        centerX: center,
        centerY: center,
        textMargin: designConfig.textAlignment == "inner" ? 52 : 20,
        textAlignment: designConfig.textAlignment,
        textOrientation: designConfig.textOrientation,
        textFontSize: designConfig.textFontSize,
        lineWidth: 0.1,
        segments: designConfig.gifts
          .map((x, i) => {
            let giftPalette = designConfig.giftPalettes.find((y) => y.code == (x.code || NULL));
            let currentAngle = -angle * i - 90 - angle / 2;
            if (!giftPalette) return null;
            return {
              fillStyle: giftPalette?.backgroundColor,
              text:
                designConfig.textSplitterSize > 0
                  ? splitter(giftPalette?.name, designConfig.textSplitterSize).join("\n")
                  : giftPalette?.name,
              textFillStyle: giftPalette?.color,
              strokeStyle: giftPalette?.color == "white" ? "#111" : giftPalette?.color,
              textFontFamily: designConfig.textFontFamily,
              textFontWeight: { normal: 400, bold: 700, bolder: 800 }[designConfig.textFontWeight],
              textDirection:
                designConfig.textOrientation == "horizontal" &&
                  currentAngle < -90 &&
                  currentAngle > -270
                  ? "reversed"
                  : "normal",
            };
          })
          .filter(Boolean)
          .reverse(),
      })
    );
  };

  const splitter = (str: string, l: number) => {
    var strs = [];
    while (str.length > l) {
      var pos = str.substring(0, l).lastIndexOf(" ");
      pos = pos <= 0 ? l : pos;
      strs.push(str.substring(0, pos));
      var i = str.indexOf(" ", pos) + 1;
      if (i < pos || i > pos + l) i = pos;
      str = str.substring(i);
    }
    strs.push(str);
    return strs;
  };

  const drawPin = () => {
    if (designConfig.hasPin) {
      if (!designConfig.pinColor) {
        designConfig.pinColor = schemePalettes[3];
        setDesignConfig({ ...designConfig, pinColor: schemePalettes[3] });
      }

      let canvas = pinRef.current;
      let ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let center = canvas.width / 2;

      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.beginPath();
      ctx.moveTo(center - 36, center);
      ctx.lineTo(center, center - 64);
      ctx.lineTo(center + 36, center);
      ctx.closePath();
      ctx.fillStyle = designConfig.pinColor;
      ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
      ctx.shadowBlur = 6;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(center, center, 36, 0, Math.PI * 2, false);
      ctx.fillStyle = designConfig.pinColor;
      ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
      ctx.shadowBlur = 3;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(center, center, 28, 0, Math.PI * 2, false);
      ctx.fillStyle = "white";
      ctx.shadowColor = "#333";
      ctx.shadowBlur = 1;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowColor = "none";

      if (designConfig.pinLogo) {
        let size = 32;
        let image = new Image();
        image.setAttribute("crossOrigin", "anonymous");
        image.style.objectFit = "contain";
        image.width = size;
        image.height = size;
        image.onload = () => {
          ctx.drawImage(image, center - size / 2, center - size / 2, size, size);
        };
        image.src = designConfig.pinLogo;
      }
    }
  };

  const copyColor = (color: string) => {
    copy(color);
    toast.dark("Đã copy màu vào clipboard", { delay: 200 });
  };

  const createImage = async () => {
    let dataURL;
    let canvas = canvasRef.current;
    try {
      dataURL = canvas.toDataURL("image/png", 0.9).split(",")[1];
    } catch (e) {
      dataURL = canvas.toDataURL().split(",")[1];
    }
    try {
      let res = await uploadImage(dataURL);
      designConfig.imageUrl = res.link;
      setDesignConfig({ ...designConfig });
      await LuckyWheelService.update({ id: luckyWheel.id, data: { designConfig } });
      onWheelChange({ designConfig, wheelImage: designConfig.imageUrl });
      toast.success("Tạo ảnh vòng quay thành công. Đã gắn ảnh vòng quay vào form.");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi xảy ra khi tạo ảnh vòng quay. " + err.message);
    }
  };

  const createPinImage = async () => {
    let dataURL;
    let canvas = pinRef.current;
    try {
      dataURL = canvas.toDataURL("image/png", 0.9).split(",")[1];
    } catch (e) {
      dataURL = canvas.toDataURL().split(",")[1];
    }
    try {
      let res = await uploadImage(dataURL);
      designConfig.pinUrl = res.link;
      setDesignConfig({ ...designConfig });
      await LuckyWheelService.update({ id: luckyWheel.id, data: { designConfig } });
      onWheelChange({ designConfig, pinUrl: designConfig.pinUrl });
      toast.success("Tạo ảnh pin thành công. Đã gắn ảnh pin vào form.");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi xảy ra khi tạo ảnh pin. " + err.message);
    }
  };

  return (
    <Dialog width="1120px" title="Công cụ tạo vòng quay và pin" {...props}>
      <Dialog.Body>
        {designConfig && (
          <>
            <div className="flex">
              <Input
                className="w-56"
                value={designConfig.palette}
                onChange={(val) => setDesignConfig({ ...designConfig, palette: val })}
                placeholder="Hex hoặc WebColors"
                prefix="Màu"
                prefixClassName="bg-gray-100 text-sm border-r border-gray-300"
              />
              {palettes && (
                <>
                  {palettes?.map((palette, index) => (
                    <div
                      key={palette}
                      style={{ backgroundColor: palette }}
                      className={`flex-1 h-10 cursor-pointer border-t border-b border-gray-100 transition-all hover:border transform hover:scale-125 hover:z-10 ${index == 0 ? "ml-2" : ""
                        }`}
                      onClick={() => copyColor(palette)}
                    ></div>
                  ))}
                  {schemePalettes?.map((palette, index) => (
                    <div
                      key={palette}
                      style={{ backgroundColor: palette }}
                      className={`flex-1 h-10 cursor-pointer border-t border-b border-gray-100 transition-all hover:border transform hover:scale-125 hover:z-10 ${index == 0 ? "ml-2" : ""
                        }`}
                      onClick={() => copyColor(palette)}
                    ></div>
                  ))}
                </>
              )}
            </div>
            <div className="flex items-center mt-2 text-gray-700 whitespace-nowrap">
              <span className="ml-1 mr-2 text-sm">Gợi ý màu</span>
              {WEB_COLORS.map((color) => (
                <span
                  className="relative text-sm font-semibold cursor-pointer group"
                  style={{ color: color.value }}
                  key={color.value}
                  onClick={() =>
                    setDesignConfig({
                      ...designConfig,
                      palette: color.value,
                    })
                  }
                >
                  <span className="px-1 text-gray-700">{color.label}</span>
                  <span
                    className="absolute left-0 z-10 px-1 underline opacity-0 group-hover:opacity-100"
                    style={{ color: color.value }}
                  >
                    {color.label}
                  </span>
                </span>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center text-gray-700">
                <span className="text-sm font-semibold">Thiết lập phần thưởng</span>
                <Button
                  className="pl-56 text-sm underline"
                  icon={<RiShuffleFill />}
                  text="Trộn màu"
                  onClick={() => initGifts(true)}
                />
                <span className="pl-6 text-sm">
                  * Ưu tiên sử dụng nguồn ảnh từ{" "}
                  <a
                    className="underline hover:text-primary"
                    href="https://imgur.com"
                    target="_blank"
                    rel="noopener"
                  >
                    Imgur
                  </a>
                </span>
              </div>
              {designConfig.giftPalettes.map((giftPalette, index) => (
                <div key={index} className="flex mb-1 rounded border-group">
                  <Input className="w-32" readOnly value={giftPalette.code} />
                  <Input
                    className="w-56 pl-0"
                    placeholder="Tên giải thưởng"
                    prefix={<RiGiftLine />}
                    prefixClassName="min-w-8"
                    value={giftPalette.name}
                    onChange={(val) => {
                      if (giftPalette.name != val) {
                        giftPalette.name = val;
                        setDesignConfig({ ...designConfig });
                        initGifts();
                      }
                    }}
                  />
                  <Input
                    className="pl-0 w-36"
                    placeholder="Màu sắc"
                    prefix={<RiPaletteLine />}
                    prefixClassName="min-w-8"
                    value={giftPalette.backgroundColor}
                    onChange={(val) => {
                      if (giftPalette.backgroundColor != val) {
                        giftPalette.backgroundColor = val;
                        setDesignConfig({ ...designConfig });
                        initGifts();
                      }
                    }}
                  />
                  <ImageInput
                    className="flex-1"
                    placeholder="Hình ảnh"
                    onChange={(val) => {
                      if (giftPalette.image != val) {
                        giftPalette.image = val;
                        setDesignConfig({ ...designConfig });
                        initGifts();
                      }
                    }}
                  />
                  <Input
                    className="w-32 pl-0"
                    placeholder="Size ảnh"
                    prefix={<RiFullscreenLine />}
                    prefixClassName="min-w-8"
                    number
                    value={giftPalette.size}
                    onChange={(val) => {
                      if (giftPalette.size != val) {
                        giftPalette.size = val;
                        setDesignConfig({ ...designConfig });
                        initGifts();
                      }
                    }}
                  />
                  <Input
                    className="w-32 pl-0"
                    placeholder="Độ cao"
                    prefix={<RiArrowUpDownLine />}
                    prefixClassName="min-w-8"
                    number
                    value={giftPalette.offset}
                    onChange={(val) => {
                      if (giftPalette.offset != val) {
                        giftPalette.offset = val;
                        setDesignConfig({ ...designConfig });
                        initGifts();
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex mt-4">
              <div className="grid self-start flex-1 grid-cols-2 gap-5 pr-4">
                <Field label="Font chữ" noError>
                  <Select
                    options={fontFamilies.map((x) => ({ value: x, label: x }))}
                    value={designConfig.textFontFamily}
                    onChange={(val) => {
                      if (designConfig.textFontFamily != val) {
                        designConfig.textFontFamily = val;
                        setDesignConfig({ ...designConfig });
                        initWheel();
                      }
                    }}
                  />
                </Field>
                <Field label="Độ dày chữ" noError>
                  <Select
                    options={FONT_WEIGHTS}
                    value={designConfig.textFontWeight}
                    onChange={(val) => {
                      if (designConfig.textFontWeight != val) {
                        designConfig.textFontWeight = val;
                        setDesignConfig({ ...designConfig });
                        initWheel();
                      }
                    }}
                  />
                </Field>
                <Field label="Hướng chữ" noError>
                  <Select
                    options={TEXT_ORIENTATIONS}
                    value={designConfig.textOrientation}
                    onChange={(val) => {
                      if (designConfig.textOrientation != val) {
                        designConfig.textOrientation = val;
                        if (
                          designConfig.textOrientation == "curved" ||
                          designConfig.textOrientation == "vertical"
                        ) {
                          if (!MONO_FONT_FAMILIES.includes(designConfig.textFontFamily)) {
                            designConfig.textFontFamily = MONO_FONT_FAMILIES[0];
                          }
                        } else {
                          if (!PROPORTIONAL_FONT_FAMILIES.includes(designConfig.textFontFamily)) {
                            designConfig.textFontFamily = PROPORTIONAL_FONT_FAMILIES[0];
                          }
                        }
                        setDesignConfig({ ...designConfig });
                        initWheel();
                      }
                    }}
                  />
                </Field>
                <Field label="Vị trí chữ" noError>
                  <Select
                    options={TEXT_ALIGNMENTS}
                    value={designConfig.textAlignment}
                    onChange={(val) => {
                      if (designConfig.textAlignment != val) {
                        designConfig.textAlignment = val;
                        setDesignConfig({ ...designConfig });
                        initWheel();
                      }
                    }}
                  />
                </Field>
                <Field label="Kích thước chữ" noError>
                  <Input
                    number
                    value={designConfig.textFontSize}
                    onChange={(val) => {
                      if (designConfig.textFontSize != val) {
                        designConfig.textFontSize = val;
                        setDesignConfig({ ...designConfig });
                        initWheel();
                      }
                    }}
                  />
                </Field>
                <Field label="Số ký tự xuống dòng" noError>
                  <Input
                    number
                    value={designConfig.textSplitterSize}
                    onChange={(val) => {
                      if (designConfig.textSplitterSize != val) {
                        designConfig.textSplitterSize = val;
                        setDesignConfig({ ...designConfig });
                        initWheel();
                      }
                    }}
                  />
                </Field>
                <div className="col-span-2 pl-1 text-sm text-gray-700">
                  * Đối với hướng chữ dọc và cong sẽ dùng bộ Font khác với hướng ngang.
                  <br />
                  ** Trong trường hợp bị <b>lỗi font</b>, xin hãy tạo lại nhiều lần bằng cách bấm{" "}
                  <a
                    className="font-semibold underline cursor-pointer hover:text-primary"
                    onClick={initWheel}
                  >
                    Refresh
                  </a>
                </div>
                <div className="col-span-2">
                  <div className="border-group">
                    <Checkbox
                      className="border border-gray-300 whitespace-nowrap bg-gray-50"
                      placeholder="Tạo pin"
                      value={designConfig.hasPin}
                      onChange={(val) => {
                        if (designConfig.hasPin != val) {
                          designConfig.hasPin = val;
                          setDesignConfig({ ...designConfig });
                          initWheel();
                        }
                      }}
                    />
                    <Input
                      className="w-36"
                      prefixClassName="min-w-8"
                      prefix={<RiPaletteLine />}
                      placeholder="Màu pin"
                      readOnly={!designConfig.hasPin}
                      value={designConfig.pinColor}
                      onChange={(val) => {
                        if (designConfig.pinColor != val) {
                          designConfig.pinColor = val;
                          setDesignConfig({ ...designConfig });
                          initWheel();
                        }
                      }}
                    />
                    <ImageInput
                      placeholder="Logo pin"
                      readOnly={!designConfig.hasPin}
                      value={designConfig.pinLogo}
                      onChange={(val) => {
                        if (designConfig.pinLogo != val) {
                          designConfig.pinLogo = val;
                          setDesignConfig({ ...designConfig });
                          initWheel();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="col-span-2 rounded border-group">
                  <Button
                    outline
                    className="shrink-0 whitespace-nowrap w-52"
                    icon={<RiAddCircleLine />}
                    text="Tạo ảnh vòng quay"
                    onClick={createImage}
                  />
                  <Input
                    value={designConfig.imageUrl}
                    readOnly
                    style={{ backgroundColor: "#fafafa !important" }}
                  />
                </div>

                {designConfig.hasPin && (
                  <div className="col-span-2 rounded border-group">
                    <Button
                      outline
                      className="shrink-0 whitespace-nowrap w-52"
                      icon={<RiAddCircleLine />}
                      text="Tạo ảnh pin"
                      onClick={createPinImage}
                    />
                    <Input
                      value={designConfig.pinUrl}
                      readOnly
                      style={{ backgroundColor: "#fafafa !important" }}
                    />
                  </div>
                )}
              </div>
              <div className="relative flex-center" style={{ width: "500px", height: "500px" }}>
                <div style={{ fontFamily: designConfig.textFontFamily }} hidden>
                  aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆ
                  fFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTu
                  UùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ
                </div>
                {loadingWheel && <Spinner className="absolute" />}
                <canvas id="canvas" ref={canvasRef} width="500" height="500">
                  {" "}
                  Tính năng này không được hỗ trợ, xin dùng trình duyệt khác.{" "}
                </canvas>
                <canvas
                  className="absolute top-0 left-0"
                  id="pin-canvas"
                  ref={pinRef}
                  width="500"
                  height="500"
                >
                  {" "}
                  Tính năng này không được hỗ trợ, xin dùng trình duyệt khác.{" "}
                </canvas>
                {!loadingWheel && designConfig.hasPin && designConfig.pinLogo && (
                  <img
                    className="absolute object-contain w-full h-auto pointer-events-none"
                    src={designConfig.pinLogo}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </Dialog.Body>
    </Dialog>
  );
}

const GetHSL = (color) => {
  if (color.startsWith("#")) {
    return HexToHSL(color);
  } else {
    let d = document.createElement("div");
    d.style.color = color;
    document.body.appendChild(d);
    let rgb: any = window.getComputedStyle(d).color;
    d.remove();
    rgb = rgb.replace("rgb(", "");
    rgb = rgb.replace(")", "");
    rgb = rgb.split(", ");
    return RGBToHSL(Number(rgb[0]), Number(rgb[1]), Number(rgb[2]));
  }
};

const HexToHSL = (H) => {
  let r: any = 0,
    g: any = 0,
    b: any = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
  // return "hsl(" + h + "," + s + "%," + l + "%)";
};

const RGBToHSL = (r, g, b) => {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
  // return "hsl(" + h*360 + "," + s*100 + "%," + l*100 + "%)";
};

const HSLtoHex = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const FONT_WEIGHTS: Option[] = [
  { label: "Thường", value: "bold" },
  { label: "Dày", value: "bolder" },
  { label: "Mỏng", value: "normal" },
];

const TEXT_ORIENTATIONS: Option[] = [
  { label: "Ngang", value: "horizontal" },
  { label: "Cong", value: "curved" },
  { label: "Dọc", value: "vertical" },
];

const TEXT_ALIGNMENTS: Option[] = [
  { label: "Ngoài", value: "outer" },
  { label: "Trong", value: "inner" },
];

const WEB_COLORS: Option[] = [
  { label: "Đỏ", value: "crimson" },
  { label: "Nâu", value: "maroon" },
  { label: "Gạch", value: "IndianRed" },
  { label: "Đỏ cam", value: "orangered" },
  { label: "Cam", value: "Orange" },
  { label: "Vàng", value: "gold" },
  { label: "Olive", value: "DarkOliveGreen" },
  { label: "Xanh lá", value: "ForestGreen" },
  { label: "Xanh lục", value: "MediumAquamarine" },
  { label: "Xanh lam", value: "Turquoise" },
  { label: "Xanh dương", value: "deepskyblue" },
  { label: "Xanh biển", value: "RoyalBlue" },
  { label: "Chàm", value: "indigo" },
  { label: "Tím", value: "violet" },
  { label: "Hồng", value: "hotpink" },
  { label: "Xám", value: "gray" },
  { label: "Thép", value: "LightSlateGray" },
];

const PROPORTIONAL_FONT_FAMILIES = [
  "Open Sans",
  "Kanit",
  "Anton",
  "Play",
  "Nunito",
  "Dosis",
  "Exo",
  "Raleway",
  "Bungee",
  "Arima Madurai",
];
const MONO_FONT_FAMILIES = [
  "Roboto Mono",
  "Source Code Pro",
  "Space Mono",
  "VT323",
  "Major Mono Display",
];
const RADIUS = 215;
const TEXT_ALIGNMENT = "outer";
