interface PropsType extends ReactProps {
  text: string;
}
export function ReportTitle({ text, ...props }: PropsType) {
  return <h2 className="font-bold text-gray-800 text-xl uppercase mb-2">{text}</h2>;
}
