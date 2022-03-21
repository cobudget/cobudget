-- RenameTable
ALTER TABLE "_BucketToCollectionMember" RENAME TO "_BucketToRoundMember";

-- RenameIndex
ALTER INDEX "_BucketToCollectionMember_AB_unique" RENAME TO "_BucketToRoundMember_AB_unique";

-- RenameIndex
ALTER INDEX "_BucketToCollectionMember_B_index" RENAME TO "_BucketToRoundMember_B_index";
