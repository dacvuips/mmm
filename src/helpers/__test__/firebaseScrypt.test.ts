import firebaseScrypt from "../firebaseScrypt";

export default describe("Firebase Scrypt", () => {
  test("hash password", async () => {
    const user = {
      passwordHash:
        "CdPfjzum1bdE0keqKqGeEyx9Fx2svaHLX89n2o0xL2TWn5d9ZuVrDASxs2L/S5TbWOFeei9a3PC2GIOmFGXY9A==",
      salt: "jZUNdJTuXS1KGA==",
    };
    const pass = "123123";

    const hash = await firebaseScrypt.hash(pass, user.salt);
    expect(hash).toBe(user.passwordHash);
  });

  test("verify password", async () => {
    const user = {
      passwordHash:
        "CdPfjzum1bdE0keqKqGeEyx9Fx2svaHLX89n2o0xL2TWn5d9ZuVrDASxs2L/S5TbWOFeei9a3PC2GIOmFGXY9A==",
      salt: "jZUNdJTuXS1KGA==",
    };
    const pass = "123123";

    const verify = await firebaseScrypt.verify(pass, user.salt, user.passwordHash);
    expect(verify).toBe(true);
  });

  test("new account", async () => {
    const pass = "123123";
    const salt =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const hash = await firebaseScrypt.hash(pass, salt);

    const verify = await firebaseScrypt.verify(pass, salt, hash);
    expect(verify).toBe(true);
  });
});
