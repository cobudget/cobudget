export interface CollectionTransaction {
    id: string,
    amount: number,
    amountBefore: number,
    collectionMemberId: string,
    bucketId?: string,
    allocatedById?: string,
    allocationType?: string,
    transactionType: string,
    createdAt: string,
}