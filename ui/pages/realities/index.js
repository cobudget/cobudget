import React from "react";
//import styled from "styled-components";
import { Col, Container, Row } from "reactstrap";

import SubMenu from "components/SubMenu";
import HappySpinner from "components/HappySpinner";
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
      <Container fluid>
        {/*<SearchRow className="d-md-none">
          <Col>
            <Search />
          </Col>
        </SearchRow>*/}
        <Row>
          <Col md="6" lg={{ size: 4, offset: 1 }}>
            <NeedsContainer currentUser={currentUser} />
          </Col>
          <Col md="6">
            <DetailViewContainer currentUser={currentUser} viewResp={false} />
            <DetailViewContainer currentUser={currentUser} viewResp />
          </Col>
        </Row>
      </Container>
    </div>
  </>
);

const RealitiesPage = ({ currentOrgMember, currentUser }) => {
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

export default RealitiesPage;
