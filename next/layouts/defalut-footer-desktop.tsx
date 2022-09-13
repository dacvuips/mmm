import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../components/shared/utilities/form";
import { Img } from "../components/shared/utilities/misc";
import { Post, PostService } from "../lib/repo/post.repo";
import { Topic, TopicService } from "../lib/repo/topic.repo";

type Props = {};

export function DefaultFooterDesktop({ }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [topic, setTopic] = useState<Topic>();

  useEffect(() => {
    TopicService.getAll({ query: { filter: { slug: "thong-tin-chinh-sach" } } }).then((res) => {
      if (res.data[0]) {
        setTopic(res.data[0]);
      }
    });
  }, []);
  useEffect(() => {
    if (topic) {
      PostService.getAll({
        query: { filter: { topicIds: topic.id } },
      })
        .then((res) => setPosts(res.data))
        .catch(console.error);
    }
  }, [topic]);
  return (
    <div className="bg-primary">
      <div className="flex flex-col items-start justify-between py-8 sm:flex-row main-container">
        <div className="w-1/4">
          <div className="mb-3 font-semibold leading-6 text-white text-[16px]">Địa chỉ công ty</div>
          <div className="flex flex-col text-white">
            <span className="">CÔNG TY TNHH 3M TECH</span>
            <span className="my-1 text-sm">
              <span className="font-normal ">Địa chỉ: </span>225 Nguyễn Xí, Phường 13, Quận Bình
              Thạnh, Tp.HCM
            </span>
            <span className="my-1 text-sm">
              <span className="font-normal ">Điện thoại: </span> 0976789880
            </span>
            <span className="my-1 text-sm">
              <span className="text-sm font-normal">Giấy CN ĐKDN số: </span>0317084055 do Sở Kế hoạch và Đầu tư TP.HCM cấp ngày 15/12/2021
            </span>
            <span className="my-1 text-sm">
              <span className="font-normal ">Email: </span>support@giaohang.shop
            </span>
            <span className="my-1 text-sm">
              <span className="font-normal ">Người đại diện: </span>Nguyễn Sơn Hùng
            </span>
          </div>
        </div>
        <div>
          <div className="mb-3 font-semibold leading-6 text-white text-[16px]">Chính sách</div>

          {posts.map((item, index) => (
            <div className="" key={item.id}>
              <Button
                targetBlank
                href={`/3MMarketing/news/${item.slug}`}
                text={item.title}
                className={`text-white pl-0 border-none font-normal text-sm`}
                hoverWhite
              />
            </div>
          ))}
        </div>
        <div>
          <div className="mb-3 font-semibold leading-6 text-white text-[16px]">Ứng dụng 3M</div>
          <Link href="https://play.google.com/store/apps/details?id=app.somo.shop">
            <a target="_blank">
              <img src="/assets/img/googleplay.png" alt="" className="object-cover mt-2 w-44" />
            </a>
          </Link>
          <Link href="https://apps.apple.com/vn/app/somo-shop/id1612563243?l=vi">
            <a target="_blank">
              <img src="/assets/img/appstore.png" alt="" className="object-cover mt-2 w-44" />
            </a>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center w-1/6 text-center">
          <Img
            src="/assets/img/logo-som-icon.png"
            className="object-cover w-12 rounded-md"
            alt="logo"
          />

          <p className="mt-3 text-white">3M - Kinh doanh tinh gọn ©2022 3M APP</p>
        </div>
      </div>
    </div>
  );
}
