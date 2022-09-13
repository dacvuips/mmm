import { AiOutlineGooglePlus } from "react-icons/ai";
import { RiFacebookFill, RiInstagramFill, RiTwitterFill } from "react-icons/ri";

const conectSocials = [
  { icon: <RiFacebookFill /> },
  { icon: <AiOutlineGooglePlus /> },
  { icon: <RiTwitterFill /> },
  { icon: <RiInstagramFill /> },
];

export function SocialNetwork() {
  return (
    <div className="flex flex-col h-auto gap-6">
      {conectSocials.map((item, idx) => (
        <i className="text-xl cursor-pointer md:text-2xl text-primary" key={idx}>
          {item.icon}
        </i>
      ))}
      <div className="w-1 h-8 ml-2 md:h-12 bg-primary"></div>
    </div>
  );
}
