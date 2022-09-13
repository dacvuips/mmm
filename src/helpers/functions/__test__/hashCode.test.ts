import { hashCode } from "../hashCode";

export default test("Hash Code", async () => {
  const str = "hello world";
  const h1 = hashCode(str);
  const h2 = hashCode(str);

  console.log("hash", str, h1);

  expect(h1).toEqual(h2);
});
