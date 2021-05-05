import About from "components/About";
import SubMenu from "components/SubMenu";

export default function AboutPage({ router, event, currentOrgMember }) {
  if (!event) return null;
  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <div className="page">
        <About router={router} />
      </div>
    </>
  );
}
