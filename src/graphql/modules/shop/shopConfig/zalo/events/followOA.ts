import _ from "lodash";
import { configs } from "../../../../../../configs";
import zalo from "../../../../../../helpers/zalo";
import { ZaloMessageBuilder } from "../../../../../../helpers/zalo/zaloMessageBuilder";
import { MemberLoader } from "../../../../member/member.model";
import { getZaloToken, ZaloEventContext } from "../common";

export default async function execute(ctx: ZaloEventContext) {
  const {
    logger,
    event: {
      follower: { id: followerId },
    },
    shopConfig,
  } = ctx;

  const {
    memberId,
    zaloConfig: {
      eventFollowOA: { active, image, title, subTitle, btnTitle, message },
    },
  } = shopConfig;

  logger.info("eventFollowOA", { eventFollowOA: shopConfig.zaloConfig.eventFollowOA });

  if (active == false) return;

  const token = await getZaloToken(shopConfig);

  const member = await MemberLoader.load(memberId.toString());
  const { shopName, shopCover, code, address } = member;

  if (_.isEmpty(message) == false) {
    // Gửi tin nhắn đầu tiên
    const sendData = new ZaloMessageBuilder().text(message).send(followerId);
    await zalo.message(token, sendData);
  }

  {
    // Gửi tin nhắn kèm link mở cửa hàng
    const sendData = new ZaloMessageBuilder()
      .list([
        {
          title: title || shopName,
          subtitle: subTitle || address,
          image_url: image || shopCover,
        },
        {
          title: btnTitle || "Xem cửa hàng",
          image_url: "https://i.imgur.com/cguy4n6.png",
          default_action: {
            type: "oa.open.url",
            url: `${
              configs.zalo.redirectDomain || configs.domain
            }/${code}?followerId=${followerId}`,
          },
        },
      ])
      .send(followerId);

    await zalo.message(token, sendData);
  }
}
