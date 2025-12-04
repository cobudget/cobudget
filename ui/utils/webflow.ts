import get from "lodash/get";

export const getWebflowProps = (basePath) => {
  return async function getStaticProps(ctx) {
    if (process.env.LANDING_PAGE_URL) {
      // Import modules in here that aren't needed in the component
      const cheerio = await import(`cheerio`);
      const axios = (await import(`axios`)).default;

      // Use path to determine additional Webflow path
      let url = get(ctx, `params.path`, []);
      url = url.join(`/`);
      if (url.charAt(0) !== `/`) {
        url = `/${url}`;
      }
      const fetchUrl = process.env.LANDING_PAGE_URL + basePath + url;

      // Fetch HTML
      const res: any = await axios(fetchUrl).catch((err) => {
        console.error(err);
      });

      const html = res.data;

      // Parse HTML with Cheerio
      const $ = cheerio.load(html);
      const bodyContent = $(`body`).html();
      const headContent = $(`head`).html();

      // Send HTML to component via props
      return {
        props: {
          landingPage: { bodyContent, headContent },
        },
      };
    }

    return {
      props: {},
    };
  };
};

export const webflowCss = `
   .w-layout-grid {
     display: -ms-grid;
     display: grid;
     grid-auto-columns: 1fr;
     -ms-grid-columns: 1fr 1fr;
     grid-template-columns: 1fr 1fr;
     -ms-grid-rows: auto auto;
     grid-template-rows: auto auto;
     grid-row-gap: 16px;
     grid-column-gap: 16px;
   }
   
   body {
     background-color: #fff;
     font-family: Inter, sans-serif;
     color: #202020;
     font-size: 16px;
     line-height: 20px;
     letter-spacing: -0.2px;
   }
   
   h1 {
     margin-top: 0px;
     margin-bottom: 24px;
     font-size: 45px;
     line-height: 1.25em;
     font-weight: 500;
   }
   
   h2 {
     margin-top: 0px;
     margin-bottom: 16px;
     font-size: 34px;
     line-height: 1.2em;
     font-weight: 500;
   }
   
   h3 {
     margin-top: 0px;
     margin-bottom: 16px;
     font-size: 26px;
     line-height: 1.4em;
     font-weight: 500;
   }
   
   h4 {
     margin-top: 0px;
     margin-bottom: 12px;
     color: #33383f;
     font-size: 22px;
     line-height: 1.4em;
     font-weight: 600;
   }
   
   h5 {
     margin-top: 0px;
     margin-bottom: 12px;
     font-size: 14px;
     line-height: 1.5em;
     font-weight: 500;
     letter-spacing: 1px;
     text-transform: uppercase;
   }
   
   h6 {
     margin-top: 0px;
     margin-bottom: 5px;
     color: #99a4af;
     font-size: 13px;
     line-height: 1.5em;
     font-weight: 700;
     letter-spacing: 1px;
     text-transform: uppercase;
   }
   
   p {
     margin-bottom: 16px;
     font-size: 16px;
     line-height: 1.5em;
     font-weight: 400;
   }
   
   a {
     -webkit-transition: color 200ms ease;
     transition: color 200ms ease;
     color: #1292c9;
     text-decoration: none;
   }
   
   a:hover {
     color: #4ab7e5;
   }
   
   ul {
     margin-top: 0px;
     margin-bottom: 16px;
     padding-left: 20px;
   }
   
   li {
     margin-bottom: 8px;
     opacity: 0.9;
     font-size: 18px;
     line-height: 1.4em;
   }
   
   img {
     display: inline-block;
     max-width: 100%;
   }
   
   label {
     display: block;
     margin-bottom: 6px;
     color: #626a72;
     font-size: 15px;
     font-weight: 400;
   }
   
   strong {
     font-weight: 600;
   }
   
   em {
     font-family: 'Libre Baskerville', sans-serif;
     font-style: italic;
     letter-spacing: -0.5px;
   }
   
   blockquote {
     margin-bottom: 16px;
     padding: 10px 20px;
     border-left: 5px solid #4ab7e5;
     color: #33383f;
     font-size: 18px;
     line-height: 1.4em;
   }
   
   .wrapper {
     width: 100%;
     min-height: 80vh;
   }
   
   .section {
     position: relative;
     z-index: 0;
     padding-top: 100px;
     padding-bottom: 100px;
   }
   
   .section.light-grey {
     position: relative;
     background-color: #f5f8f9;
   }
   
   .section.small {
     padding-top: 40px;
     padding-bottom: 40px;
   }
   
   .section.medium {
     padding-top: 60px;
     padding-bottom: 60px;
   }
   
   .section.rainbow-gradient {
     margin-top: -80px;
     padding-top: 200px;
     padding-bottom: 120px;
     background-image: url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/63363cdc5d70bf9bcf955881_Frame%2017899.png");
     background-position: 50% 100%;
     background-size: cover;
     background-repeat: no-repeat;
     color: #fff;
   }
   
   .section.orange-gradient {
     background-color: #f46f39;
     background-image: radial-gradient(circle farthest-corner at 0% 100%, #dfc53d, rgba(223, 197, 61, 0) 54%), linear-gradient(141deg, #f89b1d 34%, #f1595a);
     color: #fff;
   }
   
   .section.background-image {
     background-color: transparent;
     background-image: url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/6346a0b83b628e5f2846a680_Untitled%20design%20(6).png");
     background-position: 50% 100%;
     background-repeat: no-repeat;
   }
   
   .section.nav-rainbow-gradient {
     margin-top: -80px;
     padding-top: 80px;
     background-image: url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/633654c99694c75bf99834f4_Frame%2017899%201.png");
     background-position: 50% 100%;
     background-size: cover;
     background-repeat: no-repeat;
     color: #fff;
   }
   
   .section.blue-gradient {
     background-color: #4ab7e5;
     background-image: radial-gradient(circle farthest-corner at 0% 100%, #dfc53d, rgba(223, 197, 61, 0) 54%), linear-gradient(141deg, #4ab7e5 34%, #86c44a);
     color: #fff;
   }
   
   .section.small-rainbow-gradient {
     padding-top: 80px;
     padding-bottom: 60px;
     background-image: url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/633654c99694c75bf99834f4_Frame%2017899%201.png");
     background-position: 50% 100%;
     background-size: cover;
     background-repeat: no-repeat;
     color: #fff;
   }
   
   .button {
     margin-bottom: 8px;
     padding: 8px 32px;
     -webkit-box-flex: 0;
     -webkit-flex: 0 0 auto;
     -ms-flex: 0 0 auto;
     flex: 0 0 auto;
     border-radius: 4px;
     background-color: #fff;
     box-shadow: 0 3px 0 0 rgba(32, 32, 32, 0.05);
     -webkit-transition: box-shadow 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease, -webkit-transform 200ms ease;
     transition: box-shadow 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease, -webkit-transform 200ms ease;
     transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease;
     transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease, -webkit-transform 200ms ease;
     color: #202020;
     font-size: 18px;
     line-height: 1.5;
     font-weight: 500;
     text-align: center;
   }
   
   .button:hover {
     background-color: #dee5eb;
     color: #202020;
   }
   
   .button:active {
     background-color: #c2cdd8;
     box-shadow: 0 0 0 0 rgba(32, 32, 32, 0);
     -webkit-transform: translate(0px, 3px);
     -ms-transform: translate(0px, 3px);
     transform: translate(0px, 3px);
   }
   
   .button.outline {
     background-color: transparent;
     box-shadow: inset 0 0 0 1px hsla(0, 0%, 100%, 0.5);
     color: #fff;
   }
   
   .button.outline:hover {
     background-color: #fff;
     box-shadow: inset 0 0 0 1px #fff;
     color: #202020;
   }
   
   .button.outline:active {
     background-color: #dee5eb;
     box-shadow: inset 0 0 0 2px #dee5eb;
   }
   
   .button.light {
     background-color: #edf1f3;
     box-shadow: none;
     color: #33383f;
   }
   
   .button.light:hover {
     background-color: #c2cdd8;
     color: #202020;
   }
   
   .button.light:active {
     background-color: #99a4af;
     color: #33383f;
   }
   
   .button.arrow {
     margin-right: 0px;
     margin-left: 24px;
     padding-right: 16px;
     padding-left: 0px;
     background-color: transparent;
     background-image: url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/63363c7e44211aec88c01b3e_Black%20Right%20Arrow.svg");
     background-position: 100% 50%;
     background-size: auto 14px;
     background-repeat: no-repeat;
     box-shadow: none;
     -webkit-transition: padding-right 200ms ease, box-shadow 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease, -webkit-transform 200ms ease;
     transition: padding-right 200ms ease, box-shadow 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease, -webkit-transform 200ms ease;
     transition: padding-right 200ms ease, box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease;
     transition: padding-right 200ms ease, box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease, color 200ms ease, background-color 200ms ease, -webkit-transform 200ms ease;
     color: #202020;
   }
   
   .button.arrow:hover {
     padding-right: 20px;
   }
   
   .button.arrow:active {
     -webkit-transform: none;
     -ms-transform: none;
     transform: none;
   }
   
   .button.blue {
     background-color: #4ab7e5;
     color: #fff;
   }
   
   .button.blue:hover {
     background-color: #2d94c0;
   }
   
   .button.black {
     background-color: #202020;
     color: #fff;
   }
   
   .button.grey {
     background-color: #dee5eb;
     box-shadow: none;
   }
   
   .button.grey.footer-full-width {
     width: 100%;
     padding-top: 8px;
     padding-bottom: 8px;
     font-size: 16px;
   }
   
   .spacer {
     height: 48px;
     background-color: #dee5eb;
   }
   
   .spacer._32 {
     width: 32px;
     height: 32px;
     border-radius: 6px;
     background-color: transparent;
   }
   
   .spacer._24 {
     width: 24px;
     height: 24px;
     background-color: transparent;
     text-transform: uppercase;
   }
   
   .spacer._48 {
     width: 48px;
     border-radius: 6px;
     background-color: transparent;
   }
   
   .spacer._80 {
     width: 80px;
     height: 80px;
     background-color: transparent;
   }
   
   .spacer._32 {
     height: 32px;
     background-color: transparent;
   }
   
   .spacer._16 {
     width: 16px;
     height: 16px;
     -webkit-box-flex: 0;
     -webkit-flex: 0 0 auto;
     -ms-flex: 0 0 auto;
     flex: 0 0 auto;
     background-color: transparent;
   }
   
   .text-box {
     max-width: 650px;
   }
   
   .text-box.center-align {
     margin-right: auto;
     margin-left: auto;
     -webkit-align-self: center;
     -ms-flex-item-align: center;
     -ms-grid-row-align: center;
     align-self: center;
     text-align: center;
   }
   
   .text-box._550px {
     max-width: 550px;
   }
   
   .text-box._550px.centered {
     margin-right: auto;
     margin-left: auto;
   }
   
   .text-box._400px {
     overflow: visible;
     max-width: 400px;
   }
   
   .text-box._500px {
     max-width: 500px;
   }
   
   .text-box.centered {
     margin-right: auto;
     margin-left: auto;
   }
   
   .text-box._800px {
     max-width: 800px;
   }
   
   .text-box._900px {
     max-width: 900px;
   }
   
   ._12-columns {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     margin-right: -16px;
     margin-left: -16px;
     -webkit-box-orient: horizontal;
     -webkit-box-direction: normal;
     -webkit-flex-direction: row;
     -ms-flex-direction: row;
     flex-direction: row;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-flex-wrap: wrap;
     -ms-flex-wrap: wrap;
     flex-wrap: wrap;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     -webkit-align-content: stretch;
     -ms-flex-line-pack: stretch;
     align-content: stretch;
   }
   
   ._12-columns.align-center {
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     text-align: center;
   }
   
   .container {
     position: relative;
     display: block;
     width: 100%;
     max-width: 1330px;
     min-height: 30px;
     margin-right: auto;
     margin-left: auto;
     padding-right: 50px;
     padding-left: 50px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
   }
   
   .container.center-align {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     text-align: center;
   }
   
   .white {
     color: #fff;
     font-weight: 300;
   }
   
   .column {
     position: relative;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     min-height: 32px;
     padding-right: 16px;
     padding-left: 16px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-flex-wrap: nowrap;
     -ms-flex-wrap: nowrap;
     flex-wrap: nowrap;
     -webkit-box-align: stretch;
     -webkit-align-items: stretch;
     -ms-flex-align: stretch;
     align-items: stretch;
     -webkit-box-flex: 0;
     -webkit-flex: 0 auto;
     -ms-flex: 0 auto;
     flex: 0 auto;
   }
   
   .column.desk-12 {
     width: 100%;
   }
   
   .column.desk-6 {
     width: 50%;
   }
   
   .column.desk-5 {
     width: 41.66%;
   }
   
   .column.desk-0-5 {
     width: 4.166666666666667%;
     -webkit-box-flex: 0;
     -webkit-flex: 0 auto;
     -ms-flex: 0 auto;
     flex: 0 auto;
   }
   
   .rich-text img {
     border-radius: 5px;
   }
   
   .rich-text h4 {
     margin-top: 24px;
   }
   
   .rich-text h3 {
     margin-top: 24px;
   }
   
   .rich-text p {
     font-family: Lato, sans-serif;
     font-size: 18px;
     text-align: left;
   }
   
   .rich-text em {
     font-family: Lato, sans-serif;
   }
   
   .rich-text.team-tmp {
     font-style: normal;
     text-align: center;
   }
   
   .nav-content {
     position: relative;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     margin-left: 24px;
     -webkit-box-orient: horizontal;
     -webkit-box-direction: normal;
     -webkit-flex-direction: row;
     -ms-flex-direction: row;
     flex-direction: row;
     -webkit-box-pack: justify;
     -webkit-justify-content: space-between;
     -ms-flex-pack: justify;
     justify-content: space-between;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     -webkit-box-flex: 1;
     -webkit-flex: 1;
     -ms-flex: 1;
     flex: 1;
   }
   
   .nav-cta-button-container {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
   }
   
   .menu-button.w--open {
     background-color: #fff;
     color: rgba(9, 106, 208, 0.2);
   }
   
   .nav-bar {
     position: -webkit-sticky;
     position: sticky;
     top: 0px;
     z-index: 200;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     -webkit-box-orient: horizontal;
     -webkit-box-direction: normal;
     -webkit-flex-direction: row;
     -ms-flex-direction: row;
     flex-direction: row;
     -webkit-box-pack: justify;
     -webkit-justify-content: space-between;
     -ms-flex-pack: justify;
     justify-content: space-between;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     background-color: transparent;
   }
   
   .logo-div {
     display: block;
     margin-top: 4px;
     -webkit-box-pack: justify;
     -webkit-justify-content: space-between;
     -ms-flex-pack: justify;
     justify-content: space-between;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     -webkit-box-flex: 0;
     -webkit-flex: 0 auto;
     -ms-flex: 0 auto;
     flex: 0 auto;
   }
   
   .nav-logo {
     -webkit-transition: opacity 200ms ease;
     transition: opacity 200ms ease;
   }
   
   .nav-logo:hover {
     opacity: 0.75;
   }
   
   .footer-logo {
     margin-bottom: 20px;
   }
   
   .footer-link {
     display: block;
     margin-bottom: 0px;
     padding-top: 5px;
     padding-bottom: 5px;
     -webkit-transition: color 200ms ease-in-out;
     transition: color 200ms ease-in-out;
     color: #202020;
     font-size: 15px;
     text-decoration: none;
     cursor: pointer;
   }
   
   .footer-link:hover {
     opacity: 1;
     color: #99a4af;
   }
   
   .footer-link.w--current {
     opacity: 1;
   }
   
   .footer-links-container {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
   }
   
   .footer {
     position: relative;
     z-index: 0;
     padding-top: 48px;
     padding-bottom: 64px;
     background-color: #f5f8f9;
   }
   
   .icon {
     width: 44px;
     height: 44px;
     margin-bottom: 20px;
     color: #fff;
     font-size: 24px;
   }
   
   .banner-section {
     padding-right: 50px;
     padding-left: 50px;
     background-color: #f5f8f9;
     color: #33383f;
   }
   
   .banner-container {
     display: block;
     max-width: 1080px;
     margin-right: auto;
     margin-left: auto;
     -webkit-box-flex: 1;
     -webkit-flex: 1;
     -ms-flex: 1;
     flex: 1;
   }
   
   .banner {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     margin-right: auto;
     margin-left: auto;
     padding-top: 12px;
     padding-bottom: 12px;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     font-size: 14px;
     line-height: 1.4em;
     font-weight: 500;
     text-align: center;
   }
   
   .nav-dropdown {
     position: relative;
     margin-right: 2px;
     margin-left: 6px;
     padding: 5px 22px 5px 8px;
     border-radius: 5px;
     -webkit-transition: color 200ms ease;
     transition: color 200ms ease;
     color: #33383f;
     line-height: 26px;
     font-weight: 500;
   }
   
   .nav-dropdown:hover {
     opacity: 1;
     color: #1b9cca;
   }
   
   .nav-dropdown.w--current {
     -webkit-transition-property: none;
     transition-property: none;
     color: #096ad0;
     font-weight: 700;
   }
   
   .paragraph {
     font-family: Lato, sans-serif;
   }
   
   .paragraph.small {
     opacity: 0.75;
     font-size: 14px;
     line-height: 1.4em;
   }
   
   .paragraph.small.grey {
     color: #33383f;
   }
   
   .paragraph.large {
     font-size: 20px;
     line-height: 1.4em;
   }
   
   .paragraph.medium {
     font-size: 18px;
   }
   
   .paragraph.x-large {
     font-size: 28px;
   }
   
   .paragraph.grey {
     color: #626a72;
   }
   
   .paragraph.inline {
     display: inline;
   }
   
   .white-input {
     width: 280px;
     height: 45px;
     margin-right: 8px;
     margin-bottom: 16px;
     border-style: solid;
     border-width: 1px;
     border-color: #f5f8f9;
     border-radius: 2px;
     box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.02);
     color: #202020;
     font-size: 16px;
   }
   
   .white-input:focus {
     border-color: #7af545;
   }
   
   .white-input::-webkit-input-placeholder {
     color: #99a4af;
   }
   
   .white-input:-ms-input-placeholder {
     color: #99a4af;
   }
   
   .white-input::-ms-input-placeholder {
     color: #99a4af;
   }
   
   .white-input::placeholder {
     color: #99a4af;
   }
   
   .no-margin {
     margin-top: 0px;
     margin-bottom: 0px;
   }
   
   .nav-menu {
     padding-right: 12px;
     -webkit-box-flex: 1;
     -webkit-flex: 1;
     -ms-flex: 1;
     flex: 1;
     text-align: left;
   }
   
   .form-success {
     padding: 32px;
     border-radius: 4px;
     background-color: #dee5eb;
     color: #33383f;
     font-size: 16px;
     line-height: 1.4em;
   }
   
   .text-input {
     margin-bottom: 16px;
     padding: 21px 16px;
     border: 1px solid #eff1f3;
     border-radius: 4px;
     background-color: #f5f8f9;
     font-size: 15px;
     line-height: 1.4px;
   }
   
   .text-input:focus {
     border-color: #4ab7e5;
   }
   
   .text-input::-webkit-input-placeholder {
     color: #c2cdd8;
   }
   
   .text-input:-ms-input-placeholder {
     color: #c2cdd8;
   }
   
   .text-input::-ms-input-placeholder {
     color: #c2cdd8;
   }
   
   .text-input::placeholder {
     color: #c2cdd8;
   }
   
   .text-input.no-margin {
     margin-bottom: 0px;
   }
   
   .text-input.white {
     background-color: #fff;
   }
   
   .card {
     overflow: hidden;
     width: 100%;
     height: 100%;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     border-radius: 4px;
     background-color: #fff;
     -webkit-transition: opacity 200ms ease, -webkit-transform 200ms ease;
     transition: opacity 200ms ease, -webkit-transform 200ms ease;
     transition: transform 200ms ease, opacity 200ms ease;
     transition: transform 200ms ease, opacity 200ms ease, -webkit-transform 200ms ease;
     color: #202020;
     text-align: left;
   }
   
   .card:hover {
     -webkit-transform: translate(0px, -3px);
     -ms-transform: translate(0px, -3px);
     transform: translate(0px, -3px);
     color: #202020;
   }
   
   .card-thumbnail {
     width: 100%;
     height: 20vw;
     max-height: 320px;
     border-radius: 2px;
     -o-object-fit: cover;
     object-fit: cover;
   }
   
   .tag {
     display: inline-block;
     margin-bottom: 6px;
     padding: 3px 12px;
     border-style: solid;
     border-width: 1px;
     border-color: #dee5eb;
     border-radius: 2px;
     color: #626a72;
     font-size: 12px;
     line-height: 16px;
     font-weight: 700;
     text-align: center;
     letter-spacing: 0.4px;
   }
   
   .tabs-menu {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     margin-bottom: 48px;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
   }
   
   .vertical-tab {
     width: 100%;
     margin-top: 24px;
     margin-bottom: 64px;
   }
   
   .tab-link {
     margin-right: 0px;
     margin-left: 0px;
     padding: 15px 20px;
     -webkit-box-flex: 0;
     -webkit-flex: 0 auto;
     -ms-flex: 0 auto;
     flex: 0 auto;
     border-bottom: 2px solid #dee5eb;
     background-color: transparent;
     color: #99a4af;
     font-size: 18px;
     text-align: center;
   }
   
   .tab-link:hover {
     color: #202020;
   }
   
   .tab-link.w--current {
     border-bottom-color: #202020;
     background-color: transparent;
     opacity: 1;
     color: #202020;
     font-weight: 600;
   }
   
   .cta-box {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     padding: 52px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     border-radius: 4px;
     background-color: #e6f7ff;
   }
   
   .nav-container {
     left: 0px;
     top: 0px;
     right: 0px;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     height: 75px;
     max-width: 1330px;
     margin-right: auto;
     margin-left: auto;
     padding: 12px 50px;
     -webkit-box-orient: horizontal;
     -webkit-box-direction: normal;
     -webkit-flex-direction: row;
     -ms-flex-direction: row;
     flex-direction: row;
     -webkit-box-pack: justify;
     -webkit-justify-content: space-between;
     -ms-flex-pack: justify;
     justify-content: space-between;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
   }
   
   .error-2 {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     margin-right: -15px;
     margin-left: -15px;
     -webkit-box-pack: justify;
     -webkit-justify-content: space-between;
     -ms-flex-pack: justify;
     justify-content: space-between;
     -webkit-flex-wrap: wrap;
     -ms-flex-wrap: wrap;
     flex-wrap: wrap;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     grid-auto-columns: 1fr;
     -ms-grid-columns: 1fr 1fr;
     grid-template-columns: 1fr 1fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .card-summary {
     margin-bottom: 0px;
     color: #69737c;
     font-size: 16px;
     line-height: 1.4em;
   }
   
   .logo {
     display: block;
     margin-top: -2px;
   }
   
   .nav-link {
     margin-right: 4px;
     margin-left: 4px;
     padding: 6px 8px;
     -webkit-transition: background-color 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     transition: background-color 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     transition: background-color 200ms ease, transform 200ms ease, color 200ms ease;
     transition: background-color 200ms ease, transform 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     color: #fff;
     line-height: 24px;
     font-weight: 400;
     cursor: pointer;
   }
   
   .nav-link:hover {
     color: #dee5eb;
   }
   
   .nav-link:active {
     color: #01658a;
   }
   
   .nav-link.w--current {
     opacity: 0.75;
     color: #fff;
   }
   
   .nav-link.secondary {
     margin-right: 8px;
     padding-right: 20px;
     padding-left: 20px;
     border-radius: 50px;
     background-color: #fff;
     color: #54e417;
   }
   
   .nav-link.secondary:hover {
     background-color: rgba(154, 204, 255, 0.8);
   }
   
   .nav-link.secondary:active {
     background-color: #eeffe7;
   }
   
   .nav-link.primary {
     padding-right: 20px;
     padding-left: 20px;
     border-radius: 2px;
     background-color: #fff;
     -webkit-transition: box-shadow 200ms ease, background-color 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     transition: box-shadow 200ms ease, background-color 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     transition: box-shadow 200ms ease, background-color 200ms ease, transform 200ms ease, color 200ms ease;
     transition: box-shadow 200ms ease, background-color 200ms ease, transform 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     color: #202020;
     font-weight: 500;
   }
   
   .nav-link.primary:hover {
     background-color: #dee5eb;
   }
   
   .nav-link.primary:active {
     background-color: #c2cdd8;
     box-shadow: 0 0 0 0 #dee5eb;
     -webkit-transform: translate(0px, 2px);
     -ms-transform: translate(0px, 2px);
     transform: translate(0px, 2px);
   }
   
   .nav-link.secondary {
     margin-left: 0px;
     padding-right: 10px;
     padding-left: 10px;
     border-radius: 2px;
     background-color: transparent;
     -webkit-transition: box-shadow 200ms ease, background-color 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     transition: box-shadow 200ms ease, background-color 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     transition: box-shadow 200ms ease, background-color 200ms ease, transform 200ms ease, color 200ms ease;
     transition: box-shadow 200ms ease, background-color 200ms ease, transform 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
     color: #fff;
   }
   
   .nav-link.secondary:hover {
     background-color: transparent;
     color: #dee5eb;
   }
   
   .nav-link.secondary:active {
     -webkit-transform: translate(0px, 2px);
     -ms-transform: translate(0px, 2px);
     transform: translate(0px, 2px);
     color: #202020;
   }
   
   .error {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     margin-right: -15px;
     margin-left: -15px;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-flex-wrap: wrap;
     -ms-flex-wrap: wrap;
     flex-wrap: wrap;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     grid-auto-columns: 1fr;
     -ms-grid-columns: 1fr 1fr;
     grid-template-columns: 1fr 1fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .banner-link {
     display: inline;
     margin-right: 0px;
     margin-left: 0px;
     padding-right: 0px;
     padding-left: 0px;
     color: #01658a;
     line-height: 1.3em;
     font-weight: 600;
     text-decoration: none;
   }
   
   .banner-link:hover {
     color: #4ab7e5;
   }
   
   .footer-header {
     color: #c2cdd8;
     font-size: 14px;
     font-weight: 700;
     letter-spacing: 1px;
     text-transform: uppercase;
   }
   
   .footer-container {
     display: block;
     width: 100%;
     max-width: 1330px;
     margin-right: auto;
     margin-left: auto;
     padding-top: 40px;
     padding-right: 50px;
     padding-left: 50px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
   }
   
   .heading {
     display: block;
     font-weight: 500;
   }
   
   .heading.h1 {
     margin-bottom: 18px;
     font-size: 48px;
     line-height: 1.2em;
   }
   
   .heading.h1.no-margin {
     margin-bottom: 0px;
   }
   
   .heading.h2 {
     margin-bottom: 20px;
     font-size: 34px;
     line-height: 1.3em;
   }
   
   .heading.h2.taller {
     line-height: 1.85em;
   }
   
   .heading.h2.taller.no-margin {
     margin-bottom: 0px;
   }
   
   .heading.h3 {
     margin-bottom: 12px;
     font-size: 26px;
     line-height: 1.4em;
   }
   
   .heading.h3.no-margin {
     margin-bottom: 0px;
   }
   
   .heading.h4 {
     margin-bottom: 12px;
     font-size: 21px;
     line-height: 1.4em;
   }
   
   .heading.large-h1 {
     margin-bottom: 32px;
     font-size: 65px;
     line-height: 1.2em;
   }
   
   .error2 {
     position: relative;
     left: 0px;
     top: 0px;
     right: 0px;
     display: block;
     width: 100%;
     max-width: 1230px;
     margin-right: auto;
     margin-left: auto;
     padding-right: 40px;
     padding-left: 40px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
   }
   
   .utility-page-wrap {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100vw;
     height: 90vh;
     max-height: 100%;
     max-width: 100%;
     padding: 20px;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
   }
   
   .utility-page-content {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 320px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     text-align: center;
   }
   
   .utility-page-form {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     max-width: 400px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
   }
   
   .email-form {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     -webkit-box-orient: horizontal;
     -webkit-box-direction: normal;
     -webkit-flex-direction: row;
     -ms-flex-direction: row;
     flex-direction: row;
     -webkit-box-pack: start;
     -webkit-justify-content: flex-start;
     -ms-flex-pack: start;
     justify-content: flex-start;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     -webkit-box-flex: 1;
     -webkit-flex: 1;
     -ms-flex: 1;
     flex: 1;
   }
   
   .blog-image {
     position: relative;
     display: block;
     height: 350px;
     margin-right: auto;
     margin-left: auto;
     border-radius: 2px;
     -o-object-fit: cover;
     object-fit: cover;
   }
   
   .pricing-3-grid {
     display: -ms-grid;
     display: grid;
     width: 100%;
     grid-auto-columns: 1fr;
     grid-column-gap: 32px;
     grid-row-gap: 32px;
     -ms-grid-columns: 1fr 1fr 1fr;
     grid-template-columns: 1fr 1fr 1fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .email-subscribe {
     position: relative;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-align: start;
     -webkit-align-items: flex-start;
     -ms-flex-align: start;
     align-items: flex-start;
   }
   
   .search {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     margin-bottom: 0px;
     -webkit-box-align: start;
     -webkit-align-items: flex-start;
     -ms-flex-align: start;
     align-items: flex-start;
   }
   
   .container-2 {
     position: relative;
     z-index: 2;
     display: block;
     width: 100%;
     max-width: 1280px;
     min-height: 50px;
     margin-right: auto;
     margin-left: auto;
     padding-right: 40px;
     padding-left: 40px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
   }
   
   .button-row {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-flex-wrap: wrap;
     -ms-flex-wrap: wrap;
     flex-wrap: wrap;
     grid-column-gap: 16px;
   }
   
   .dot-divider {
     position: relative;
     top: -1px;
     font-size: 11px;
   }
   
   .coloured-card {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     overflow: hidden;
     width: 100%;
     padding: 30px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-pack: justify;
     -webkit-justify-content: space-between;
     -ms-flex-pack: justify;
     justify-content: space-between;
     border-radius: 12px;
     background-color: #4ab7e5;
     background-image: radial-gradient(circle farthest-corner at 50% 140%, #80529b, rgba(128, 82, 155, 0) 86%);
     -webkit-transition: opacity 200ms ease;
     transition: opacity 200ms ease;
     color: #fff;
     text-align: left;
   }
   
   .coloured-card.green {
     background-color: #86c44a;
     background-image: radial-gradient(circle farthest-corner at -20% 80%, rgba(246, 196, 41, 0.5), rgba(246, 196, 41, 0) 86%);
   }
   
   .coloured-card.orange {
     background-color: #f46f39;
     background-image: radial-gradient(circle farthest-corner at 100% 0%, rgba(246, 196, 41, 0.5), rgba(246, 196, 41, 0) 86%);
   }
   
   .video-box {
     position: relative;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     overflow: hidden;
     width: 100%;
     height: 59vw;
     max-height: 755px;
     margin-bottom: 32px;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     border-radius: 8px;
   }
   
   .full-video {
     display: block;
     width: 100%;
   }
   
   .tick-list-2 {
     margin-bottom: 16px;
   }
   
   .tick-list-2 li {
     margin-bottom: 14px;
     padding-left: 28px;
     background-image: url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/633644856a6d11013049764b_Path.svg");
     background-position: 0px 7px;
     background-size: auto;
     background-repeat: no-repeat;
     font-size: 16px;
   }
   
   .tick-list-2 ul {
     padding-left: 0px;
   }
   
   .pricing-card {
     position: relative;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     height: 100%;
     padding: 30px 30px 24px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-pack: justify;
     -webkit-justify-content: space-between;
     -ms-flex-pack: justify;
     justify-content: space-between;
     border-radius: 6px;
     background-color: #fff;
     box-shadow: 0 5px 12px 0 rgba(0, 0, 0, 0.04);
     color: #1f1f1f;
     text-align: left;
   }
   
   .mo-text {
     margin-left: 8px;
     font-size: 32px;
     font-weight: 400;
   }
   
   .green-text {
     color: #41a319;
     font-weight: 500;
   }
   
   .medium-weight {
     font-weight: 500;
   }
   
   .f-right-arrow {
     position: absolute;
     left: auto;
     top: -38px;
     right: 0px;
     bottom: auto;
     z-index: 2;
     width: 18px;
     height: 24px;
     margin-left: 62px;
     -webkit-transition: opacity 200ms ease;
     transition: opacity 200ms ease;
   }
   
   .f-right-arrow:hover {
     opacity: 0.7;
   }
   
   .slide-card {
     display: -ms-grid;
     display: grid;
     width: auto;
     height: 280px;
     padding: 32px;
     -webkit-box-orient: horizontal;
     -webkit-box-direction: normal;
     -webkit-flex-direction: row;
     -ms-flex-direction: row;
     flex-direction: row;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     grid-auto-columns: 1fr;
     grid-column-gap: 10%;
     grid-row-gap: 16px;
     -ms-grid-columns: 1fr 2fr;
     grid-template-columns: 1fr 2fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .company-slider {
     width: 100%;
     height: auto;
     max-width: 100%;
     border-style: solid;
     border-width: 1px;
     border-color: #dee5eb;
     border-radius: 6px;
     background-color: #f5f8f9;
     box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.04);
   }
   
   .company-slider.hidden {
     display: none;
   }
   
   .f-left-arrow {
     left: auto;
     top: -38px;
     right: 90px;
     bottom: auto;
     z-index: 2;
     width: 18px;
     height: 24px;
     -webkit-transition: opacity 200ms ease;
     transition: opacity 200ms ease;
   }
   
   .f-left-arrow:hover {
     opacity: 0.7;
   }
   
   .company-slide-nav {
     left: auto;
     top: -30px;
     right: 30px;
     bottom: auto;
     height: 15px;
     padding-top: 0px;
     font-size: 10px;
   }
   
   .company-card-slide {
     position: static;
     width: 100%;
     height: 100%;
   }
   
   .company-logo-box {
     position: relative;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     height: 95%;
     padding-right: 32px;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     border-right: 2px solid #dee5eb;
     background-color: #f5f8f9;
   }
   
   .company-slide-left {
     position: relative;
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     margin-bottom: 92px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-align: start;
     -webkit-align-items: flex-start;
     -ms-flex-align: start;
     align-items: flex-start;
     grid-column-gap: 80px;
     -ms-grid-columns: 1fr 2fr;
     grid-template-columns: 1fr 2fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .company-slide-right {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     width: 100%;
     margin-bottom: 92px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: reverse;
     -webkit-flex-direction: column-reverse;
     -ms-flex-direction: column-reverse;
     flex-direction: column-reverse;
     -webkit-box-align: start;
     -webkit-align-items: flex-start;
     -ms-flex-align: start;
     align-items: flex-start;
     grid-column-gap: 80px;
     -ms-grid-columns: 2fr 1fr;
     grid-template-columns: 2fr 1fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .company-slider-mask {
     width: 100%;
     max-width: 100%;
   }
   
   .card-number {
     margin-top: auto;
     font-size: 26px;
     line-height: 1em;
     font-weight: 600;
   }
   
   .cards-3-grid {
     display: -ms-grid;
     display: grid;
     width: 100%;
     grid-auto-columns: 1fr;
     grid-column-gap: 32px;
     grid-row-gap: 32px;
     -ms-grid-columns: 1fr 1fr 1fr;
     grid-template-columns: 1fr 1fr 1fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .footer-grid {
     -ms-grid-columns: 4fr 1fr 1fr 220px;
     grid-template-columns: 4fr 1fr 1fr 220px;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .footer-text-box {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     max-width: 280px;
     -webkit-box-orient: vertical;
     -webkit-box-direction: normal;
     -webkit-flex-direction: column;
     -ms-flex-direction: column;
     flex-direction: column;
     -webkit-box-align: start;
     -webkit-align-items: flex-start;
     -ms-flex-align: start;
     align-items: flex-start;
   }
   
   .company-logo-image.dark {
     mix-blend-mode: darken;
   }
   
   .team-tmp {
     font-family: Lato, sans-serif;
     font-size: 20px;
     line-height: 18.5px;
     font-weight: 400;
     text-align: center;
   }
   
   .columns {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     max-width: 800px;
     -webkit-box-flex: 0;
     -webkit-flex: 0 auto;
     -ms-flex: 0 auto;
     flex: 0 auto;
     -o-object-fit: fill;
     object-fit: fill;
   }
   
   .column-2 {
     padding-right: 20px;
     padding-left: 20px;
   }
   
   .column-3 {
     padding-right: 20px;
     padding-left: 20px;
   }
   
   .rich-text-tmp {
     text-align: right;
   }
   
   .rich-text-tmp img {
     border-radius: 5px;
   }
   
   .rich-text-tmp h4 {
     margin-top: 24px;
   }
   
   .rich-text-tmp h3 {
     margin-top: 24px;
   }
   
   .rich-text-tmp p {
     font-family: Lato, sans-serif;
     font-size: 18px;
     text-align: left;
   }
   
   .rich-text-tmp em {
     font-family: Lato, sans-serif;
   }
   
   .rich-text-tmp.team-tmp {
     font-style: normal;
     text-align: center;
   }
   
   .blog-hero-image {
     position: relative;
     display: block;
     width: 100%;
     height: 400px;
     margin-bottom: 16px;
     border-radius: 8px;
     -o-object-fit: cover;
     object-fit: cover;
   }
   
   .grid {
     -ms-grid-columns: 1fr 1fr 1fr;
     grid-template-columns: 1fr 1fr 1fr;
   }
   
   .collection-list-wrapper {
     display: block;
   }
   
   .collection-list-wrapper-2 {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
   }
   
   .grid-2 {
     -ms-grid-columns: 1fr 1fr 1fr;
     grid-template-columns: 1fr 1fr 1fr;
   }
   
   .team-grid {
     display: -ms-grid;
     display: grid;
     grid-auto-columns: 1fr;
     grid-column-gap: 48px;
     grid-row-gap: 24px;
     -ms-grid-columns: 1fr 1fr 1fr 1fr;
     grid-template-columns: 1fr 1fr 1fr 1fr;
     -ms-grid-rows: auto auto;
     grid-template-rows: auto auto;
   }
   
   .profile-picture {
     width: 160px;
     height: 160px;
     margin-bottom: 8px;
     border-radius: 300px;
     -o-object-fit: cover;
     object-fit: cover;
   }
   
   .team-grid-wrapper {
     max-width: 900px;
   }
   
   .collection-list {
     display: -ms-grid;
     display: grid;
     width: 100%;
     max-width: 950px;
     grid-auto-columns: 1fr;
     grid-column-gap: 16px;
     grid-row-gap: 16px;
     -ms-grid-columns: 1fr 1fr 1fr 1fr;
     grid-template-columns: 1fr 1fr 1fr 1fr;
     -ms-grid-rows: auto auto;
     grid-template-rows: auto auto;
   }
   
   .link-block {
     overflow: hidden;
     height: 100%;
     border-style: solid;
     border-width: 1px;
     border-color: #f5f8f9;
     border-radius: 4px;
     background-color: #fff;
     box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.05);
     -webkit-transition: color 200ms ease, -webkit-transform 200ms ease;
     transition: color 200ms ease, -webkit-transform 200ms ease;
     transition: transform 200ms ease, color 200ms ease;
     transition: transform 200ms ease, color 200ms ease, -webkit-transform 200ms ease;
   }
   
   .link-block:hover {
     -webkit-transform: translate(0px, -2px);
     -ms-transform: translate(0px, -2px);
     transform: translate(0px, -2px);
     color: #176ea8;
   }
   
   .collection-item {
     height: 100%;
   }
   
   .resourcers-grid {
     display: -ms-grid;
     display: grid;
     grid-auto-columns: 1fr;
     grid-column-gap: 24px;
     grid-row-gap: 24px;
     -ms-grid-columns: 1fr 1fr 1fr;
     grid-template-columns: 1fr 1fr 1fr;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .card-text-box {
     padding: 24px 24px 12px;
   }
   
   ._2-grid-blog-header {
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
     grid-column-gap: 64px;
     -ms-grid-rows: auto;
     grid-template-rows: auto;
   }
   
   .paragraph-2 {
     margin-top: 60px;
     font-style: italic;
     text-align: center;
   }
   
   .paragraph-2.thanks {
     width: 600px;
     margin-top: 0px;
     padding-right: 0px;
     padding-left: 0px;
     font-style: normal;
     -o-object-fit: fill;
     object-fit: fill;
   }
   
   .image {
     width: 250px;
   }
   
   .image-2 {
     width: 150px;
     text-align: center;
   }
   
   .link-block-2 {
     padding-right: 40px;
     padding-left: 40px;
     -webkit-align-self: flex-end;
     -ms-flex-item-align: end;
     align-self: flex-end;
     text-align: center;
   }
   
   .container-3 {
     display: -webkit-box;
     display: -webkit-flex;
     display: -ms-flexbox;
     display: flex;
     padding-top: 40px;
     padding-right: 0px;
     -webkit-box-pack: center;
     -webkit-justify-content: center;
     -ms-flex-pack: center;
     justify-content: center;
     -webkit-box-align: center;
     -webkit-align-items: center;
     -ms-flex-align: center;
     align-items: center;
   }
   
   .link-block-3 {
     padding-right: 40px;
     padding-left: 40px;
   }
   
   @media screen and (min-width: 1280px) {
     .section.light-grey.hidden {
       display: none;
     }
   
     .section.background-image {
       background-image: url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/6346a0b83b628e5f2846a680_Untitled%20design%20(6).png"), url("https://uploads-ssl.webflow.com/63363c7e44211a2485c01a4c/6346a665a64cb65038bd13c3_Untitled%20design%20(7).png");
       background-position: 50% 100%, 50% 50%;
       background-size: auto, auto;
       background-repeat: repeat, no-repeat;
       background-attachment: scroll, fixed;
       outline-color: #202020;
       outline-offset: 0px;
       outline-style: none;
       outline-width: 3px;
       background-clip: border-box;
       -webkit-text-fill-color: inherit;
     }
   
     .banner-container {
       max-width: 1140px;
     }
   
     .video-box {
       height: 815px;
       max-height: none;
     }
   
     .company-slide-left {
       display: -ms-grid;
       display: grid;
       -webkit-box-align: center;
       -webkit-align-items: center;
       -ms-flex-align: center;
       align-items: center;
       grid-auto-columns: 1fr;
       grid-column-gap: 80px;
       grid-row-gap: 16px;
       -ms-grid-columns: 1fr 2fr;
       grid-template-columns: 1fr 2fr;
       -ms-grid-rows: auto;
       grid-template-rows: auto;
     }
   
     .company-slide-right {
       display: -ms-grid;
       display: grid;
       -webkit-box-align: center;
       -webkit-align-items: center;
       -ms-flex-align: center;
       align-items: center;
       grid-auto-columns: 1fr;
       grid-column-gap: 80px;
       grid-row-gap: 16px;
       -ms-grid-columns: 2fr 1fr;
       grid-template-columns: 2fr 1fr;
       -ms-grid-rows: auto;
       grid-template-rows: auto;
     }
   
     .paragraph-2.thanks {
       width: 60%;
     }
   }
   
   @media screen and (max-width: 991px) {
     .button {
       position: relative;
     }
   
     ._12-columns {
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
       -webkit-flex-wrap: wrap;
       -ms-flex-wrap: wrap;
       flex-wrap: wrap;
     }
   
     .container {
       padding-right: 30px;
       padding-left: 30px;
     }
   
     .column {
       width: 50%;
     }
   
     .column.desk-6.tab-12 {
       width: 100%;
     }
   
     .column.desk-5.tab-12 {
       width: 100%;
     }
   
     .column.desk-0-5.tab-0 {
       display: none;
     }
   
     .menu-icon {
       color: #096ad0;
     }
   
     .nav-content {
       margin-left: 16px;
     }
   
     .menu-button.w--open {
       background-color: transparent;
       color: #096ad0;
     }
   
     .logo-div {
       -webkit-box-flex: 0;
       -webkit-flex: 0 auto;
       -ms-flex: 0 auto;
       flex: 0 auto;
     }
   
     .nav-logo {
       -webkit-box-flex: 1;
       -webkit-flex: 1;
       -ms-flex: 1;
       flex: 1;
     }
   
     .footer-logo {
       margin-bottom: 40px;
     }
   
     .footer-links-container {
       display: -webkit-box;
       display: -webkit-flex;
       display: -ms-flexbox;
       display: flex;
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
       -webkit-box-align: start;
       -webkit-align-items: flex-start;
       -ms-flex-align: start;
       align-items: flex-start;
     }
   
     .banner-section {
       padding-right: 60px;
       padding-left: 60px;
     }
   
     .banner-container {
       text-align: center;
     }
   
     .nav-dropdown {
       display: block;
       margin-right: 0px;
       margin-left: 0px;
       padding-right: 8px;
       padding-left: 8px;
       -webkit-box-flex: 1;
       -webkit-flex: 1;
       -ms-flex: 1;
       flex: 1;
       font-size: 15px;
       text-align: center;
     }
   
     .tab-link {
       padding-right: 13px;
       padding-left: 13px;
       font-size: 16px;
     }
   
     .nav-container {
       padding-right: 30px;
       padding-left: 30px;
     }
   
     .nav-link {
       margin-right: 0px;
       margin-left: 0px;
       font-size: 15px;
     }
   
     .nav-link.secondary {
       padding-right: 16px;
       padding-left: 16px;
     }
   
     .nav-link.primary {
       padding-right: 16px;
       padding-left: 16px;
     }
   
     .nav-link.secondary {
       padding-right: 16px;
       padding-left: 16px;
     }
   
     .footer-container {
       padding-right: 30px;
       padding-left: 30px;
     }
   
     .heading.large-h1 {
       font-size: 58px;
     }
   
     .error2 {
       padding-right: 30px;
       padding-left: 30px;
     }
   
     .blog-image {
       height: 300px;
     }
   
     .pricing-3-grid {
       -ms-grid-columns: 1fr 1fr;
       grid-template-columns: 1fr 1fr;
     }
   
     .container-2 {
       padding-right: 30px;
       padding-left: 30px;
     }
   
     .video-box {
       height: 60vw;
     }
   
     .slide-card {
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
       -webkit-box-pack: justify;
       -webkit-justify-content: space-between;
       -ms-flex-pack: justify;
       justify-content: space-between;
       grid-row-gap: 30px;
     }
   
     .slide-text-box {
       width: 100%;
     }
   
     .company-logo-box {
       width: 100%;
       margin-right: 0px;
     }
   
     .cards-3-grid {
       -ms-grid-columns: 1fr 1fr;
       grid-template-columns: 1fr 1fr;
     }
   
     .footer-grid {
       grid-row-gap: 24px;
       -ms-grid-columns: 1fr 1fr 1.5fr;
       grid-template-columns: 1fr 1fr 1.5fr;
     }
   
     .blog-hero-image {
       height: 320px;
     }
   
     .team-grid {
       grid-column-gap: 24px;
     }
   
     .profile-picture {
       width: 140px;
       height: 140px;
     }
   
     .resourcers-grid {
       -ms-grid-columns: 1fr 1fr;
       grid-template-columns: 1fr 1fr;
     }
   
     ._2-grid-blog-header {
       grid-column-gap: 32px;
     }
   }
   
   @media screen and (max-width: 767px) {
     h1 {
       font-size: 36px;
     }
   
     h2 {
       font-size: 32px;
     }
   
     h3 {
       font-size: 22px;
     }
   
     p {
       font-size: 15px;
     }
   
     .section {
       padding-top: 60px;
       padding-bottom: 60px;
     }
   
     .section.medium {
       padding-top: 40px;
       padding-bottom: 40px;
     }
   
     .section.rainbow-gradient {
       padding-top: 160px;
       padding-bottom: 80px;
     }
   
     .spacer {
       height: 32px;
     }
   
     .spacer._80 {
       width: 64px;
       height: 64px;
     }
   
     ._12-columns {
       -webkit-flex-wrap: wrap;
       -ms-flex-wrap: wrap;
       flex-wrap: wrap;
     }
   
     .column.desk-6 {
       width: 100%;
     }
   
     .column.desk-5 {
       width: 100%;
     }
   
     .nav-content {
       position: absolute;
       overflow: auto;
       height: 100vh;
       margin-left: 0px;
       padding-top: 20px;
       padding-bottom: 100px;
       background-color: #4ab7e5;
     }
   
     .nav-cta-button-container {
       margin-top: 20px;
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
       -webkit-box-align: stretch;
       -webkit-align-items: stretch;
       -ms-flex-align: stretch;
       align-items: stretch;
     }
   
     .menu-button {
       width: 56px;
       height: 56px;
       margin-right: -12px;
       padding: 16px;
       -webkit-box-pack: center;
       -webkit-justify-content: center;
       -ms-flex-pack: center;
       justify-content: center;
       -webkit-box-align: center;
       -webkit-align-items: center;
       -ms-flex-align: center;
       align-items: center;
     }
   
     .nav-bar {
       border: 1px none #000;
     }
   
     .logo-div {
       margin-right: auto;
     }
   
     .footer-logo {
       padding-left: 0px;
     }
   
     .footer-links-container {
       display: -webkit-box;
       display: -webkit-flex;
       display: -ms-flexbox;
       display: flex;
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
       -webkit-box-align: start;
       -webkit-align-items: flex-start;
       -ms-flex-align: start;
       align-items: flex-start;
     }
   
     .banner-section {
       padding-right: 30px;
       padding-left: 30px;
       -webkit-box-pack: start;
       -webkit-justify-content: flex-start;
       -ms-flex-pack: start;
       justify-content: flex-start;
       text-align: left;
     }
   
     .banner-container {
       text-align: left;
     }
   
     .banner {
       -webkit-box-pack: justify;
       -webkit-justify-content: space-between;
       -ms-flex-pack: justify;
       justify-content: space-between;
       -webkit-flex-wrap: wrap;
       -ms-flex-wrap: wrap;
       flex-wrap: wrap;
       text-align: left;
     }
   
     .nav-dropdown {
       padding-top: 13px;
       padding-bottom: 13px;
       font-size: 16px;
     }
   
     .nav-dropdown:hover {
       -webkit-transform: none;
       -ms-transform: none;
       transform: none;
     }
   
     .paragraph {
       font-size: 15px;
     }
   
     .paragraph.x-large {
       font-size: 16px;
     }
   
     .white-input {
       width: 100%;
     }
   
     .nav-menu {
       padding-right: 0px;
       text-align: center;
     }
   
     .card-thumbnail {
       height: 44vw;
     }
   
     .tabs-menu {
       -webkit-flex-wrap: wrap;
       -ms-flex-wrap: wrap;
       flex-wrap: wrap;
     }
   
     .tab-link {
       width: auto;
       margin-bottom: 4px;
     }
   
     .cta-box {
       padding: 40px;
     }
   
     .nav-container {
       padding-top: 8px;
       padding-bottom: 8px;
     }
   
     .logo {
       max-width: 90%;
     }
   
     .nav-link {
       margin-right: 25px;
       margin-left: 25px;
       padding-top: 12px;
       padding-bottom: 12px;
       font-size: 16px;
       text-align: center;
     }
   
     .nav-link:hover {
       -webkit-transform: none;
       -ms-transform: none;
       transform: none;
     }
   
     .nav-link.secondary {
       margin-right: 25px;
       margin-bottom: 12px;
       background-color: #ccffb6;
     }
   
     .nav-link.secondary {
       margin-left: 25px;
       background-color: transparent;
     }
   
     .footer-container {
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
     }
   
     .heading.h1 {
       font-size: 35px;
     }
   
     .heading.h2 {
       margin-bottom: 16px;
       font-size: 28px;
     }
   
     .heading.h4 {
       font-size: 20px;
     }
   
     .heading.large-h1 {
       font-size: 48px;
     }
   
     .blog-image {
       height: auto;
     }
   
     .pricing-3-grid {
       -ms-grid-columns: 1fr;
       grid-template-columns: 1fr;
     }
   
     .container-2 {
       padding-right: 20px;
       padding-left: 20px;
     }
   
     .video-box {
       height: 58vw;
     }
   
     .slide-card {
       height: auto;
       justify-items: start;
       -ms-grid-columns: 2fr;
       grid-template-columns: 2fr;
     }
   
     .company-logo-box {
       display: block;
       -webkit-box-pack: start;
       -webkit-justify-content: flex-start;
       -ms-flex-pack: start;
       justify-content: flex-start;
       border-right-style: none;
     }
   
     .cards-3-grid {
       -ms-grid-columns: 1fr;
       grid-template-columns: 1fr;
     }
   
     .company-logo-image {
       max-width: 80px;
     }
   
     .team-grid {
       -ms-grid-columns: 1fr 1fr 1fr;
       grid-template-columns: 1fr 1fr 1fr;
     }
   
     .profile-picture {
       width: 120px;
       height: 120px;
     }
   
     .team-grid-wrapper {
       width: auto;
     }
   
     .collection-list {
       -ms-grid-columns: 1fr 1fr 1fr;
       grid-template-columns: 1fr 1fr 1fr;
     }
   
     .resourcers-grid {
       -ms-grid-columns: 1fr;
       grid-template-columns: 1fr;
     }
   
     ._2-grid-blog-header {
       -ms-grid-columns: 1fr;
       grid-template-columns: 1fr;
     }
   
     .paragraph-2.thanks {
       width: auto;
     }
   }
   
   @media screen and (max-width: 479px) {
     body {
       font-size: 14px;
     }
   
     h1 {
       font-size: 32px;
     }
   
     h2 {
       font-size: 28px;
     }
   
     .button {
       width: 100%;
       font-size: 16px;
     }
   
     .container {
       padding-right: 20px;
       padding-left: 20px;
     }
   
     .column {
       margin-bottom: 0px;
     }
   
     .column.desk-6 {
       width: 100%;
     }
   
     .column.desk-5 {
       width: 100%;
     }
   
     .menu-button {
       -webkit-box-flex: 0;
       -webkit-flex: 0 auto;
       -ms-flex: 0 auto;
       flex: 0 auto;
     }
   
     .banner-section {
       margin-right: 0px;
       margin-left: 0px;
       padding-right: 20px;
       padding-left: 20px;
     }
   
     .banner {
       -webkit-box-pack: justify;
       -webkit-justify-content: space-between;
       -ms-flex-pack: justify;
       justify-content: space-between;
       text-align: left;
     }
   
     .white-input {
       width: 100%;
     }
   
     .text-input {
       width: 100%;
     }
   
     .tabs-menu {
       margin-bottom: 24px;
     }
   
     .vertical-tab {
       margin-bottom: 32px;
     }
   
     .tab-link {
       padding: 8px;
       font-size: 14px;
     }
   
     .nav-container {
       height: 64px;
       padding: 2px 20px;
     }
   
     .banner-link {
       width: 100%;
       -webkit-box-flex: 0;
       -webkit-flex: 0 auto;
       -ms-flex: 0 auto;
       flex: 0 auto;
     }
   
     .footer-container {
       padding-right: 20px;
       padding-left: 20px;
     }
   
     .heading.large-h1 {
       font-size: 36px;
     }
   
     .error2 {
       padding-right: 20px;
       padding-left: 20px;
     }
   
     .email-form {
       width: 100%;
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
     }
   
     .email-subscribe {
       width: 100%;
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
     }
   
     .search {
       -webkit-box-orient: vertical;
       -webkit-box-direction: normal;
       -webkit-flex-direction: column;
       -ms-flex-direction: column;
       flex-direction: column;
     }
   
     .container-2 {
       padding-right: 20px;
       padding-left: 20px;
     }
   
     .video-box {
       border-radius: 4px;
     }
   
     .slide-card {
       padding: 24px;
       grid-row-gap: 16px;
     }
   
     .slide-text-box {
       height: auto;
     }
   
     .company-logo-box {
       height: auto;
     }
   
     .footer-grid {
       grid-row-gap: 32px;
       -ms-grid-columns: 1fr 1fr;
       grid-template-columns: 1fr 1fr;
     }
   
     .blog-hero-image {
       height: 240px;
     }
   
     .team-grid {
       grid-row-gap: 16px;
       -ms-grid-columns: 1fr 1fr;
       grid-template-columns: 1fr 1fr;
     }
   
     .profile-picture {
       width: 100px;
       height: 100px;
     }
   
     .collection-list {
       grid-row-gap: 8px;
       -ms-grid-columns: 1fr 1fr;
       grid-template-columns: 1fr 1fr;
     }
   
     .paragraph-2.thanks {
       width: auto;
     }
   
     .container-3 {
       display: -webkit-box;
       display: -webkit-flex;
       display: -ms-flexbox;
       display: flex;
     }
   }
   
   @media screen and (max-width: 991px) {
     #w-node-b66374b8-a69d-2cb6-3980-23c2cf3fcb8a-cf3fcb86 {
       -ms-grid-row: span 1;
       grid-row-start: span 1;
       -ms-grid-row-span: 1;
       grid-row-end: span 1;
       -ms-grid-column: span 3;
       grid-column-start: span 3;
       -ms-grid-column-span: 3;
       grid-column-end: span 3;
     }
   }
   
   @media screen and (max-width: 479px) {
     #w-node-b66374b8-a69d-2cb6-3980-23c2cf3fcb8a-cf3fcb86 {
       -ms-grid-row: span 1;
       grid-row-start: span 1;
       -ms-grid-row-span: 1;
       grid-row-end: span 1;
       -ms-grid-column: span 2;
       grid-column-start: span 2;
       -ms-grid-column-span: 2;
       grid-column-end: span 2;
     }
   }`;
