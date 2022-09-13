import { gql } from "apollo-server-express";
import { WalletType } from "./wallet.model";

const schema = gql`
  extend type Query {
    getAllWallet(q: QueryGetListInput): WalletPageData
    getOneWallet(id: ID!): Wallet
    # Add Query
  }

  type Wallet {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime
    
    "Loại ví ${Object.values(WalletType)}"
    type: String
    "Số dư"
    balance: Float
    "Người sở hữu"
    owner: Owner
  }

  type WalletPageData {
    data: [Wallet]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
