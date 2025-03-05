import React from "react";
import { NextPage } from "next";
import SubMenu from "../../../../components/SubMenu";
import RoundBudgetItems from "../../../../components/RoundBudgetItems";

const RoundBudgetItemsPage: NextPage<{
  round?: any;
  currentUser?: any;
  currentGroup?: any;
}> = ({ round, currentUser }) => {
  if (!round) return null;
  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      <RoundBudgetItems round={round} currentUser={currentUser} currentGroup={currentGroup} />
    </div>
  );
};

export default RoundBudgetItemsPage;
