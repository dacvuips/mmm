import Link from "next/link";

interface PropsType extends ReactProps {
  breadcrumbs: {
    href?: string;
    label: string;
  }[];
}
export function BreadCrumbs({ breadcrumbs, className = "", ...props }: PropsType) {
  return (
    <div className={`text-sm font-semibold main-container ${className}`}>
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={index}>
          {breadcrumb.href ? (
            <>
              <Link href={breadcrumb.href}>
                <a className={`"text-gray-600" hover:underline transition-all duration-200 hover:text-accent`}>
                  <span>{breadcrumb.label}</span>
                </a>
              </Link>
              <span className="px-1.5">/</span>
            </>
          ) : (
            <a className={"text-accent"}>
              <span>{breadcrumb.label}</span>
            </a>
          )}
        </span>
      ))}
    </div>
  );
}
