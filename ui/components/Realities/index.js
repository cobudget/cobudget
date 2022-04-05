import React, { useState, useEffect } from "react";
import HappySpinner from "components/HappySpinner";
import SubMenu from "components/SubMenu";
import NeedsContainer from "./NeedsContainer";
import DetailViewContainer from "./Details/DetailViewContainer";
import Search from "./Search";

const RealitiesHome = ({ currentGroupMember, currentUser }) => (
  <>
    <SubMenu currentGroupMember={currentGroupMember} />
    <div className="page">
      <div className="md:container md:mx-auto">
        <Search />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-full md:col-span-6 lg:col-span-4 lg:col-start-2">
            <NeedsContainer currentUser={currentUser} />
          </div>
          <div className="col-span-full md:col-span-6">
            <DetailViewContainer currentUser={currentUser} viewResp={false} />
            <DetailViewContainer currentUser={currentUser} viewResp />
          </div>
        </div>
      </div>
    </div>
  </>
);

const Realities = ({ currentGroupMember, currentUser }) => {
  const [onServer, setOnServer] = useState(true);
  useEffect(() => {
    setOnServer(false);
  }, []);
  // until we've fixed ssr for the realities apollo client we'll just skip ssr here
  if (onServer) return <HappySpinner />;

  return (
    <RealitiesHome
      currentGroupMember={currentGroupMember}
      currentUser={currentUser}
    />
  );
};

export default Realities;
