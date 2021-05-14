import React from "react";
//import styled from "styled-components";
import HappySpinner from "components/HappySpinner";
import SubMenu from "components/SubMenu";
import NeedsContainer from "components/Realities/NeedsContainer";
//import Search from 'components/Search';
import DetailViewContainer from "components/Realities/Details/DetailViewContainer";

//const SearchRow = styled(Row)`
//  margin-bottom: 20px;
//`;

const RealitiesHome = ({ currentOrgMember, currentUser }) => (
  <>
    <SubMenu currentOrgMember={currentOrgMember} />
    <div className="page">
      <div className="md:container md:mx-auto">
        {/*<SearchRow className="d-md-none">
          <Col>
            <Search />
          </Col>
        </SearchRow>*/}
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

const Realities = ({ currentOrgMember, currentUser }) => {
  const onServer = typeof window === "undefined";
  // until we've fixed ssr for the realities apollo client we'll just skip ssr here
  if (onServer) return <HappySpinner />;

  return (
    <RealitiesHome
      currentOrgMember={currentOrgMember}
      currentUser={currentUser}
    />
  );
};

export default Realities;
