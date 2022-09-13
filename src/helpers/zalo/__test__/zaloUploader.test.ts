import zaloUploader from "../zaloUploader";
import path from "path";
import fs from "fs";

export default describe("ZaloUploader", () => {
  const accessToken = process.env.ZALO_TOKEN;

  it("uploadImage", async (done) => {
    expect.assertions(1);
    const filePath = path.resolve(__dirname, "./assets/kitty.jpeg");
    const result = await zaloUploader.uploadImage(accessToken, filePath);
    console.log({ result });
    expect(result.attachment_id).toBeDefined();
    done();
  });

  it("uploadGif", async (done) => {
    expect.assertions(1);
    const filePath = path.resolve(__dirname, "./assets/kitty.gift");
    const result = await zaloUploader.uploadGif(accessToken, filePath);
    console.log({ result });
    expect(result.attachment_id).toBeDefined();
    done();
  });

  it("uploadFile", async (done) => {
    expect.assertions(1);
    const filePath = path.resolve(__dirname, "./assets/file.csv");
    const result = await zaloUploader.uploadFile(accessToken, filePath);
    console.log({ result });
    expect(result.token).toBeDefined();
    done();
  });
});
