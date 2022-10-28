import { getWebflowProps } from "utils/webflow";
import Page from "./index";

export const getStaticProps = getWebflowProps("/support");

export default Page;
