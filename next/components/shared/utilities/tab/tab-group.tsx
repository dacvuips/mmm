import {
  Children,
  CSSProperties,
  MutableRefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Scrollbars from "react-custom-scrollbars";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { useUUID } from "../../../../lib/hooks/useUUID";
import { Button } from "../form";

interface PropsType extends ReactProps {
  index?: number;
  flex?: boolean;
  name?: string;
  hasArrow?: boolean;
  tabClassName?: string;
  tabsClassName?: string;
  activeClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  hasInkBar?: boolean;
  autoHeight?: boolean;
  onChange?: (index: number) => any;
}
export function TabGroup({
  index,
  flex = true,
  hasArrow = false,
  hasInkBar = true,
  name = "",
  bodyStyle = {},
  autoHeight = false,
  tabClassName = "",
  tabsClassName = "bg-white border-b border-gray-200",
  titleClassName = "text-base font-semibold whitespace-nowrap",
  subtitleClassName = "text-sm font-normal",
  activeClassName = "",
  bodyClassName = "",
  className = "",
  ...props
}: PropsType) {
  const id = useUUID();
  const inkbarRef = useRef<HTMLDivElement>();
  const tabRef = useRef<HTMLDivElement>();
  const [tabs, setTabs] = useState<{ label: string; subtitle?: string; child: JSX.Element }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(index);

  useEffect(() => {
    setTabs(
      Children.map(props.children, (child) =>
        child?.type?.displayName === "Tab" ? { ...child.props, child } : null
      ).filter(Boolean)
    );
  }, [props.children]);

  useEffect(() => {
    if (selectedIndex !== undefined && inkbarRef.current && tabs[selectedIndex]) {
      if (name) sessionStorage.setItem("tab-group-" + name, selectedIndex.toString());
      const el = document.getElementById(id + "-" + selectedIndex);
      if (el) {
        inkbarRef.current.style.width = el.offsetWidth - 16 + "px";
        inkbarRef.current.style.left = el.offsetLeft + 8 + "px";
      }
    }
  }, [inkbarRef.current, tabs, selectedIndex]);

  useEffect(() => {
    if (index !== undefined) {
      setSelectedIndex(index);
    } else {
      const index = name ? sessionStorage.getItem("tab-group-" + name) : 0;
      setSelectedIndex(Number(index || 0));
    }
  }, [index]);

  useEffect(() => {
    if (selectedIndex >= 0) {
      const el = document.getElementById(`${id}-${index}`);
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      checkArrow();
    }
  }, [selectedIndex]);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkArrow = () => {
    if (hasArrow) {
      setTimeout(() => {
        setShowLeft(tabRef.current?.scrollLeft > 32);
        setShowRight(
          tabRef.current?.scrollWidth - (tabRef.current?.scrollLeft + tabRef.current?.offsetWidth) >
            32
        );
      }, 300);
    }
  };

  return (
    <>
      {!!tabs.length && (
        <>
          <div className={`relative w-full overflow-hidden ${tabsClassName}`}>
            <Button
              icon={<RiArrowLeftSLine />}
              iconClassName="text-2xl"
              style={{
                boxShadow: "4px 0 8px -1px rgba(0, 0, 0, 0.1), 2px 0 6px -1px rgba(0, 0, 0, 0.06)",
                opacity: showLeft ? 1 : 0,
              }}
              className="absolute left-0 z-10 h-full px-0 transition-opacity bg-white border-r border-gray-100 rounded-none shadow-xl w-7"
              onClick={() => {
                tabRef.current.scrollTo({
                  left: tabRef.current.scrollLeft - tabRef.current.scrollWidth / 4,
                  behavior: "smooth",
                });
                checkArrow();
              }}
            />
            <Button
              icon={<RiArrowRightSLine />}
              iconClassName="text-2xl"
              style={{
                boxShadow:
                  "-4px 0 8px -1px rgba(0, 0, 0, 0.1), -2px 0 6px -1px rgba(0, 0, 0, 0.06)",
                opacity: showRight ? 1 : 0,
              }}
              className="absolute right-0 z-10 h-full px-0 bg-white border-r border-gray-100 rounded-none shadow-xl w-7"
              onClick={() => {
                tabRef.current.scrollTo({
                  left: tabRef.current.scrollLeft + tabRef.current.scrollWidth / 4,
                  behavior: "smooth",
                });
                checkArrow();
              }}
            />
            <div
              id={id}
              ref={tabRef}
              className={`text-center relative flex items-center overflow-x-hidden ${
                hasArrow ? "px-4" : ""
              } ${className}`}
            >
              {tabs.map((tab, index) => (
                <a
                  key={index}
                  id={id + "-" + index}
                  className={`cursor-pointer relative flex flex-col items-center ${
                    selectedIndex == index
                      ? `text-gray-800 ${activeClassName}`
                      : "text-gray-600 hover:text-gray-800"
                  } ${flex ? "flex-1" : ""} ${tabClassName}`}
                  onClick={() => {
                    setSelectedIndex(index);
                    if (props.onChange) props.onChange(index);
                  }}
                >
                  <div className={titleClassName}>{tab.label}</div>
                  <div className={subtitleClassName}>{tab.subtitle}</div>
                </a>
              ))}
              {hasInkBar && (
                <div
                  className="absolute bottom-0 h-1 transition-all duration-300 ease-in-out origin-center bg-accent"
                  ref={inkbarRef}
                ></div>
              )}
            </div>
          </div>
          <div className={`${bodyClassName}`} style={bodyStyle}>
            {autoHeight ? (
              <>{tabs[selectedIndex]?.child}</>
            ) : (
              <Scrollbars>{tabs[selectedIndex]?.child}</Scrollbars>
            )}
          </div>
        </>
      )}
    </>
  );
}

interface TabPropsType extends ReactProps {
  label: string;
  subtitle?: string;
}
const Tab = ({ children }: TabPropsType) => children;
Tab.displayName = "Tab";
TabGroup.Tab = Tab;
