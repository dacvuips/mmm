import { Newsletter } from "../../shared/landing-layout/newsletter";
import { Button } from "../../shared/utilities/form/button";
import { Img, NotFound, Spinner } from "../../shared/utilities/misc";
import { NewsProvider, useNewsContext } from "./provider/news-provider";

export function NewsPage() {
  return (
    <NewsProvider>
      <div className="flex flex-col pb-24 mt-12 md:mt-24 gap-x-10 md:gap-y-20">
        <Newsletter />
        <TopicGroup />
      </div>
    </NewsProvider>
  );
}
function TopicGroup() {
  const { topics } = useNewsContext();
  return (
    <div
      className="bg-repeat-y"
      style={{
        backgroundImage: "url('/assets/img/landing/bg-content.png')",
        backgroundSize: "100% auto",
      }}
    >
      <div className="flex flex-col gap-y-6 lg:gap-y-14 main-container">
        {topics ? (
          topics.length > 0 ? (
            topics.map((group) => (
              <div key={group.tp.name} className="mb-4 text-gray-700 lg:mb-8 md:mb-14">
                <div className="mb-4 text-3xl font-bold md:text-5xl md:mb-10">{group.tp.name}</div>
                <div className="grid gap-6 lg:gap-10 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                  {group.posts.map((news, idx) => (
                    <div
                      key={idx}
                      className="z-10 overflow-hidden bg-white border border-gray-200 shadow-md rounded-2xl"
                    >
                      <Img src={news.featureImage} ratio169 />
                      <div className="px-5 pt-5 lg:pb-5">
                        <div className="mb-1 text-xl font-medium text-left">{news.title}</div>
                        <div className="h-20 overflow-hidden text-lg leading-7 text-left text-gray-700 text-ellipsis-3">
                          {news.excerpt}
                        </div>
                        <Button
                          className="justify-end w-full px-0 mt-3 font-bold uppercase"
                          textPrimary
                          text="Xem chi tiết"
                          href={location.pathname + `/${news.slug}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <NotFound text="Bài viết đang cập nhật" />
          )
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  );
}
