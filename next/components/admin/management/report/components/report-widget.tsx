import { Img } from "../../../../shared/utilities/misc";

interface PropsType extends ReactProps {
  image: string;
}
export function ReportWidget({ image, ...props }: PropsType) {
  return (
    <div className="flex items-center">
      <Img className="w-28 mr-6 p-3" src={image} />
      <div className="text-lg text-gray-700 leading-relaxed">{props.children}</div>
    </div>
  );
}
