import { gql } from "apollo-server-express";
import { WalletTransactionType } from "./walletTransaction.model";

const schema = gql`
  extend type Query {
    getAllWalletTransaction(q: QueryGetListInput): WalletTransactionPageData
    # Add Query
  }

  type WalletTransaction {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    "Mã giao dịch"
    code: String
    "Mã ví"
    walletId: String
    "Loại giao dịch ${Object.values(WalletTransactionType)}"
    type: String
    "Số tiền"
    amount: Float
    "Ghi chú"
    note: String
    "Tag giao dịch"
    tag: String  
    "Thông tin bổ sung"
    extra: Mixed
    "Mã ví nguồn"
    fromWalletId: ID
    "Mã ví đích"
    toWalletId: ID
    "Nhãn"
    labels: [String]
  }

  type WalletTransactionPageData {
    data: [WalletTransaction]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
