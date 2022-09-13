async function main() {
  const {users} = require('../../tmp/users.json');
  console.log('users', users.length);

  const { AccountModel } = require('../../dist/graphql/modules/account/account.model');

  await AccountModel.findOne();

  const accountBulk = AccountModel.collection.initializeUnorderedBulkOp();

  for (const user of users) {
    if (!user.email) continue;
    
    accountBulk.find({ code: user.localId }).upsert().updateOne({
      $set: {
        code: user.localId,
        email: user.email,
        loginMethod: 'PASSWORD',
        passwordHash: user.passwordHash,
        salt: user.salt,
        createdAt: new Date(Number(user.createdAt)),
        lastSignedInAt: new Date(Number(user.lastSignedInAt)),
        emailVerified: user.emailVerified,
      }
    });
  }

  if (accountBulk.length) {
    console.log('inserting accounts::::' + accountBulk.length);
    await accountBulk.execute();
  }
  console.log('done');
}

main();