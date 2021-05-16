import React from "react";

import Realities from "components/Realities";
import SubMenu from "components/SubMenu";

const RealitiesPage = ({ currentOrgMember }) => {
  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} />
      <div className="page">
        <Realities />
      </div>
    </>
  );
};

export default RealitiesPage;
