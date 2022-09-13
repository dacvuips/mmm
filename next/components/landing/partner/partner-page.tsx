import { Brands } from "../../shared/landing-layout/brands";
import { Newsletter } from "../../shared/landing-layout/newsletter";
import { Trial } from "../../shared/landing-layout/trial";

export function PartnerPage() {
  const partners = [
    {
      image: "/assets/img/landing/partner-analysis.png",
      name: "Tạo website bán hàng",
      description:
        "We will pair your business with influencers that speak to your audience. Influencer Marketing is the most effective way to reach a loyal audience.",
    },
    {
      image: "/assets/img/landing/partner-social.png",
      name: "Bán hàng trên facebook",
      description: `Our social growth campaign will have your socials come alive.
      With constant growth and engagement you will be sure to have the thriving you’ve been looking for.`,
    },
    {
      image: "/assets/img/landing/partner-computer.png",
      name: "Giải pháp omni-channel",
      description: `We can create and provide your company with the best content marketing for your socials to improve online presence. Creating valuable and quality content helps boost conversions and improve customer retention.`,
    },
  ];

  return (
    <div className="py-12 md:py-24">
      <img src="https://i.imgur.com/2QSz6zN.png" className="object-cover w-full max-h-80" />
      <div className="flex flex-col items-center py-12 text-center md:py-24 main-container">
        <div className="text-lg uppercase text-primary">Trở thành đối tác</div>
        <h3 className="mt-3 mb-4 text-3xl font-bold md:text-5xl">
          Tại sao nên hợp tác cùng 3M Marketing
        </h3>
        <div className="max-w-lg mb-10 text-gray-700">
          3M Marketing mang đến cơ hội kinh doanh về một giải pháp hỗ trợ kinh doanh hiệu quả, toàn
          diện từ online đến ofline
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-8 lg:gap-x-16 main-container">
          {partners.map((partner) => (
            <div
              className="flex flex-col items-center p-6 bg-white border border-gray-200 shadow-lg rounded-2xl"
              key={partner.name}
            >
              <img className="max-h-20" src={partner.image} />
              <div className="w-full mt-6 text-lg font-bold text-center text-gray-800 uppercase">
                {partner.name}
              </div>
              <div className="mt-4 font-normal text-left text-gray-700">{partner.description}</div>
            </div>
          ))}
        </div>
      </div>
      <Trial />
      <Brands />
      <div className="pb-10 -mt-8 md:-mt-20 lg:pb-0">
        <Newsletter />
      </div>
    </div>
  );
}
