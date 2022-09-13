import { calculateExpireDay } from "../createNewSubscription";

export default describe("createNewSubscription", () => {
  test("calculateExpireDay", async () => {
    const ctx = {
      meta: {
        currentSubscription: {
          expiredAt: new Date(),
        },
        subscriptionRequest: {
          plan: "FREE",
          months: 1,
          days: 5,
        },
      },
    };
    const result = await calculateExpireDay(ctx);
    expect(result).toBeInstanceOf(Date);
  });
});
