import { forwardRef, useEffect } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import Button from "../../components/Button";
import TodoList from "../../components/TodoList";
import Label from "../../components/Label";
import SubMenu from "../../components/SubMenu";
import PageHero from "../../components/PageHero";
import EditableField from "components/EditableField";
import Router, { useRouter } from "next/router";
import GroupPage from "../../components/Group";

const IndexPage = ({ currentGroup, currentUser }) => {
  return <GroupPage currentUser={currentUser} currentGroup={currentGroup} />;
};

export default IndexPage;
