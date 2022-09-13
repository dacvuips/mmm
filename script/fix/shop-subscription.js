const { MemberModel } = require('../../dist/graphql/modules/member/member.model');
const { SubscriptionModel } = require('../../dist/graphql/modules/subscription/subscription.model');
const moment = require('moment-timezone');

(async function() {
  const members = await MemberModel.find({ subscription: { $exists: false }}, '_id');
  console.log(`Chủ shop: ${members.length}`);
  for (const m of members) {
    const expiredDate = moment().add(30, 'days').endOf('day').toDate();
    const freeSubscription = new SubscriptionModel({
      memberId: m._id,
      plan: 'FREE',
      expiredAt: expiredDate,
      fee: 0
    })
    await m.updateOne({ $set: { subscription: freeSubscription, locked: false } } ).exec();
    await freeSubscription.save();
  }
  console.log("DONE");
  process.exit();
})();