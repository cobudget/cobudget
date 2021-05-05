import React from "react";

import Realities from "components/Realities";
import DashboardMenu from "components/SubMenu";

const RealitiesPage = ({ currentOrgMember }) => {
  return (
    <>
      <DashboardMenu currentOrgMember={currentOrgMember} />
      <div className="page">
        <Realities />
      </div>
    </>
  );
};

export default RealitiesPage;
