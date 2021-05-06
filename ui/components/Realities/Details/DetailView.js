import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Card, CardBody, CardHeader } from "reactstrap";
import { FaEdit, FaTimesCircle, FaExpand, FaBars } from "react-icons/fa";
import colors from "lib/realities/colors";
import IconButton from "./IconButton";
import Dependencies from "./Dependencies";
import Deliberations from "./Deliberations";
import EditDetailsContainer from "./EditDetailsContainer";
import DeleteNodeContainer from "./DeleteNodeContainer";
import ChangeFulfills from "./ChangeFulfills";
import DetailViewBody from "./DetailViewBody";

const DetailViewCardHeader = styled(CardHeader)`
  background-color: ${(props) => props.color};
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0.5rem 0.7rem 0.5rem 1.25rem;
`;

const HeaderText = styled.span`
  line-height: 2.125rem;
`;

const HeaderButton = styled(IconButton)`
  font-size: 1.25rem;
  padding: 0 0.4rem 0.2rem 0.4rem;
`;

const Divider = styled.div`
  background-color: #ced4da;
  height: 1px;
  margin: 2rem 0;
`;

const DetailView = ({
  node,
  fullscreen,
  showEdit,
  isLoggedIn,
  startEdit,
  stopEdit,
  onClickFullscreen,
}) => {
  const isResp = node.__typename === "Responsibility";

  return (
    <Card data-cy={`detail-view-${node.__typename.toLowerCase()}`}>
      <DetailViewCardHeader
        color={isResp ? colors.responsibility : colors.need}
      >
        <HeaderButton
          onClick={onClickFullscreen}
          style={{ visibility: isResp && "hidden" }}
        >
          {fullscreen ? <FaBars /> : <FaExpand />}
        </HeaderButton>
        <HeaderText>{`${node.__typename}: ${node.title}`}</HeaderText>
        <div style={{ visibility: !isLoggedIn && "hidden" }}>
          {showEdit ? (
            <HeaderButton onClick={stopEdit}>
              <FaTimesCircle />
            </HeaderButton>
          ) : (
            <HeaderButton onClick={startEdit}>
              <FaEdit />
            </HeaderButton>
          )}
        </div>
      </DetailViewCardHeader>
      {showEdit ? (
        <CardBody>
          <EditDetailsContainer
            node={node}
            isResp={isResp}
            stopEdit={stopEdit}
          />
          <Divider />
          {isResp && (
            <>
              <ChangeFulfills node={node} />
              <Deliberations
                showAddRemove
                isLoggedIn={isLoggedIn}
                nodeType={node.__typename}
                nodeId={node.nodeId}
                deliberations={node.deliberations}
              />
              <Dependencies
                showAddRemove
                isLoggedIn={isLoggedIn}
                nodeType={node.__typename}
                nodeId={node.nodeId}
                dependencies={node.dependsOnResponsibilities || []}
              />
              <Divider />
            </>
          )}
          <DeleteNodeContainer node={node} stopEdit={stopEdit} />
        </CardBody>
      ) : (
        <DetailViewBody node={node} isResp={isResp} />
      )}
    </Card>
  );
};

DetailView.propTypes = {
  node: PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    deliberations: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        nodeId: PropTypes.string,
        title: PropTypes.string,
      })
    ),
    guide: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    realizer: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    dependsOnResponsibilities: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        nodeId: PropTypes.string,
        title: PropTypes.string,
        fulfills: PropTypes.shape({
          nodeId: PropTypes.string,
        }),
      })
    ),
  }),
  fullscreen: PropTypes.bool,
  showEdit: PropTypes.bool,
  isLoggedIn: PropTypes.bool,
  startEdit: PropTypes.func,
  stopEdit: PropTypes.func,
  onClickFullscreen: PropTypes.func,
};

DetailView.defaultProps = {
  node: {
    nodeId: "",
    title: "",
    description: "",
    deliberations: [],
    guide: {
      nodeId: "",
      email: "",
      name: "",
    },
    realizer: {
      nodeId: "",
      email: "",
      name: "",
    },
    dependsOnResponsibilities: [],
  },
  fullscreen: false,
  showEdit: false,
  isLoggedIn: false,
  startEdit: () => null,
  stopEdit: () => null,
  onClickFullscreen: () => null,
};

export default DetailView;
