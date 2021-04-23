import React from "react";

import Realities from "components/Realities";
import SubMenu from "components/SubMenu";
import HappySpinner from "components/HappySpinner";

const RealitiesPageClientSide = ({ currentOrgMember }) => {
  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} />
      <div className="page">
        <Realities />
      </div>
    </>
  );
};

const RealitiesPage = ({ currentOrgMember }) => {
  const onServer = typeof window === "undefined";
  // until we've fixed ssr for the realities apollo client we'll just skip ssr here
  if (onServer) return <HappySpinner />;

  return <RealitiesPageClientSide currentOrgMember={currentOrgMember} />;
};

export default RealitiesPage;
