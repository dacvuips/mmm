const { CollaboratorModel } = require('../../dist/graphql/modules/collaborator/collaborator.model');
const { CustomerModel } = require('../../dist/graphql/modules/customer/customer.model');
var _ = require('lodash');

(async function() {
  const data = await CollaboratorModel.aggregate([
    { $lookup: { from: 'customers', localField: 'customerId', foreignField: '_id', as: 'c'} },
    { $unwind: '$c' },
    { $match: { $expr: { $ne: ["$c.memberId", "$memberId"] } } }
  ]);
  console.log('data', JSON.stringify(_.take(data, 2), null, 2), data.length);

  for (const d of data) {
    const customer = await CustomerModel.findOne({ memberId: d.memberId, phone: d.phone });
    if (customer) {
      customer.collaboratorId = d._id;
      await customer.save();
      await CollaboratorModel.updateOne({ _id: d._id }, { $set: { customerId: customer._id }});
    }
    await CustomerModel.updateOne({ _id: d.c._id }, { $unset: { collaboratorId: 1  } })
    
  }

  console.log('DONE');
  process.exit();

})();