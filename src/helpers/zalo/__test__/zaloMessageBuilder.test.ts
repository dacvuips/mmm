import zalo from "..";
import path from "path";
import { ZaloMessageBuilder } from "../zaloMessageBuilder";
import zaloUploader from "../zaloUploader";
import _ from "lodash";
import faker from "faker";

export default describe("Zalo Message Builder", () => {
  const token = process.env.ZALO_TOKEN;
  const userId = "4007792786176218211";

  it("Text", async (done) => {
    expect.assertions(1);
    const builder = new ZaloMessageBuilder({}).text("Hello world");
    const message = builder.send(userId);
    console.log({ message });
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("Image With Url", async (done) => {
    expect.assertions(1);
    const builder = new ZaloMessageBuilder({})
      .text("Image and Url")
      .media({ media_type: "image", url: "https://placekitten.com/300" });
    const message = builder.send(userId);
    console.log({ message });
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("Image Attachment", async (done) => {
    expect.assertions(1);

    const imagePath = path.resolve(__dirname, "./assets/kitty.jpeg");
    const { attachment_id } = await zaloUploader.uploadImage(token, imagePath);
    console.log("Upload Image", attachment_id);

    const builder = new ZaloMessageBuilder({})
      .text("Image and Attachment")
      .media({ media_type: "image", attachment_id });
    const message = builder.send(userId);
    console.log({ message });
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("Gif Attachment", async (done) => {
    expect.assertions(1);

    const imagePath = path.resolve(__dirname, "./assets/kitty.gift");
    const { attachment_id } = await zaloUploader.uploadGif(token, imagePath);
    console.log("Upload Image", attachment_id);

    const builder = new ZaloMessageBuilder({})
      .text("Gif and Attachment")
      .media({ media_type: "gif", attachment_id, width: 300, height: 300 });
    const message = builder.send(userId);
    console.log({ message });
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("Gif Url", async (done) => {
    expect.assertions(1);

    const builder = new ZaloMessageBuilder({}).text("Gif and Url").media({
      media_type: "gif",
      url: "https://c.tenor.com/ZhfMGWrmCTcAAAAM/cute-kitty-best-kitty.gif",
      width: 300,
      height: 300,
    });
    const message = builder.send(userId);
    console.log({ message });
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("File", async (done) => {
    expect.assertions(1);

    const filePath = path.resolve(__dirname, "./assets/file.csv");
    const { token: fileToken } = await zaloUploader.uploadFile(token, filePath);
    console.log("Upload File", token);

    const builder = new ZaloMessageBuilder({}).text("Gif and Attachment").file(fileToken);
    const message = builder.send(userId);
    console.log({ message });
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("List", async (done) => {
    expect.assertions(1);

    const builder = new ZaloMessageBuilder({}).text("List").list([
      {
        title: faker.company.companyName(),
        subtitle: faker.address.streetAddress(),
        image_url: faker.image.city(600, 400),
        default_action: { type: "oa.open.url", url: faker.internet.url() },
      },
      {
        title: "oa.query.show",
        subtitle: "oa.query.show description",
        image_url: faker.image.avatar(),
        default_action: { type: "oa.query.show", payload: "#123" },
      },
      {
        title: "oa.query.hide",
        subtitle: "oa.query.hide description",
        image_url: faker.image.animals(),

        default_action: { type: "oa.query.hide", payload: faker.commerce.product() },
      },
      {
        title: "oa.open.sms",
        subtitle: "oa.open.sms 18001560",
        image_url: faker.image.animals(),
        default_action: {
          type: "oa.open.sms",
          payload: { content: "Hello world", phone_code: "18001560" },
        },
      },
      {
        title: "oa.open.phone",
        subtitle: "Phone 18001560",
        image_url: faker.image.animals(),
        default_action: { type: "oa.open.phone", payload: { phone_code: "18001560" } },
      },
    ]);
    const message = builder.send(userId);
    console.log(JSON.stringify(message, null, 2));
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("Button", async (done) => {
    expect.assertions(1);

    const builder = new ZaloMessageBuilder({})
      .text("Button")
      .list([
        {
          title: faker.company.companyName(),
          subtitle: faker.address.streetAddress(),
          image_url: faker.image.city(600, 400),
          default_action: { type: "oa.open.url", url: faker.internet.url() },
        },
      ])
      .buttons([
        {
          title: "OPEN URL",
          payload: {
            url: "https://developers.zalo.me/",
          },
          type: "oa.open.url",
        },
        {
          title: "QUERY SHOW",
          type: "oa.query.show",
          payload: "#callback_data",
        },
        {
          title: "QUERY HIDE",
          type: "oa.query.hide",
          payload: "#callback_data",
        },
        {
          title: "OPEN SMS",
          type: "oa.open.sms",
          payload: {
            content: "alo",
            phone_code: "84919018791",
          },
        },
        {
          title: "OPEN PHONE",
          type: "oa.open.phone",
          payload: {
            phone_code: "84919018791",
          },
        },
      ]);
    const message = builder.send(userId);
    console.log(JSON.stringify(message, null, 2));
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });

  it("Request User Info", async (done) => {
    expect.assertions(1);

    const builder = new ZaloMessageBuilder({}).requestUserInfo({
      title: "OA Chatbot (Testing)",
      subtitle: "Đang yêu cầu thông tin từ bạn",
      image_url: "https://developers.zalo.me/web/static/zalo.png",
    });
    const message = builder.send(userId);
    console.log(JSON.stringify(message, null, 2));
    const result = await zalo.message(token, message);
    console.log({ result });

    expect(result.message_id).toBeDefined();
    done();
  });
});
