export interface RoundTransaction {
  id: string;
  amount: number;
  amountBefore: number;
  roundMemberId: string;
  bucketId?: string;
  allocatedById?: string;
  allocationType?: string;
  transactionType: string;
  createdAt: Date;
  deleted: boolean;
}
