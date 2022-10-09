import { getWebflowProps } from "utils/webflow";
import Page from "./index";

export const getStaticProps = getWebflowProps("/about");

export default Page;
