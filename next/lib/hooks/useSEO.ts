export function useSEO(
  title: string,
  data: { description?: string; image?: string; keyword?: string; template?: string } = {}
) {
  return {
    titleTemplate: data.template ? `%s | ${data.template}` : `%s`,
    defaultTitle: `${title}`,
    title,
    description: data.description,
    image: data.image,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      title,
      description: data.description,
      images: [
        {
          url: data.image,
          alt: title,
        },
      ],
    },
    additionalMetaTags: [
      {
        property: "keywords",
        content: data.keyword,
      },
    ],
  };
}
