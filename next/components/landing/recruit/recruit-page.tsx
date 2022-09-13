import Link from "next/link";
import { AiOutlineClockCircle, AiOutlineDollarCircle, AiOutlineEnvironment } from "react-icons/ai";
import { Img, NotFound, Spinner } from "../../shared/utilities/misc";
import { RecruitContext, RecruitProvider } from "./provider/recruit-provider";

interface Props {}

export default function RecruitPage({ ...props }: Props) {
  return (
    <RecruitProvider>
      <div className="pb-16 my-12 xl:pb-24 md:my-24">
        <img src="https://i.imgur.com/l5ozEML.jpg" className="w-full" alt="banner" />
        <RecruitContext.Consumer>
          {({ posts }) =>
            posts ? (
              posts.length > 0 ? (
                <div className="main-container">
                  <div className="grid gap-4 mt-10 lg:grid-cols-2 lg:gap-8 lg:mt-20">
                    {posts.map((post) => (
                      <div
                        className="p-5 bg-white border border-gray-100 rounded-lg shadow-xl cursor-pointer"
                        key={post.id}
                      >
                        <Link href={`${location.pathname}/${post.slug}`}>
                          <a className="flex flex-col gap-4 md:flex-row">
                            <div className="">
                              <Img
                                src={post.featureImage}
                                alt={post.title}
                                ratio169
                                className="object-contain w-full border border-gray-100 rounded-lg md:w-48 xl:w-32"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="text-xl font-bold text-gray-700 uppercase">
                                {post.title}
                              </div>
                              <div className="flex items-stretch gap-1">
                                <i className="text-2xl text-gray-500">
                                  <AiOutlineDollarCircle />
                                </i>
                                <div className="text-lg text-brand">Up to 15.000.000 VND</div>
                              </div>
                              <div className="flex flex-col gap-2 xl:gap-4 xl:items-center xl:flex-row">
                                <div className="flex items-stretch gap-1">
                                  <i className="text-2xl text-gray-500">
                                    <AiOutlineEnvironment />
                                  </i>
                                  <div className="text-lg text-gray-500">Hà Nội</div>
                                </div>
                                <div className="flex items-stretch gap-1">
                                  <i className="text-2xl text-gray-500">
                                    <AiOutlineClockCircle />
                                  </i>
                                  <div className="text-lg text-gray-500">{`Hạn nộp hồ sơ: 25/12/2021`}</div>
                                </div>
                              </div>
                            </div>
                          </a>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="main-container">
                  <NotFound text="Không có tin tuyển dụng nào!" />
                </div>
              )
            ) : (
              <Spinner />
            )
          }
        </RecruitContext.Consumer>
      </div>
    </RecruitProvider>
  );
}
