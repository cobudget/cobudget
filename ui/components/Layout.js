import React, { useEffect } from "react";
import Header from "./Header";
import { FormattedMessage } from "react-intl";
import "../lib/beacon";
import { supportedLangs } from "lang";
import { useQuery, gql } from "urql";

const getLanguageProgressQuery = gql`
  query LanguageProgressPage {
    languageProgressPage {
      code
      percentage
    }
  }
`;

const LinkOut = ({ href, children }) => {
  return (
    <a className="underline" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

const Layout = ({
  children,
  currentUser,
  fetchingUser,
  group,
  round,
  bucket,
  dir,
  locale,
  changeLocale,
  ss,
}) => {
  const [
    { data: languageProgressResponse, fetching: languageProgressLoading },
  ] = useQuery({ query: getLanguageProgressQuery });

  const languageProgress = React.useMemo(() => {
    try {
      const progress = {};
      languageProgressResponse.languageProgressPage.forEach(
        (p) => (progress[p.code] = p.percentage)
      );
      progress.en = 100;
      return progress;
    } catch (err) {
      return {};
    }
  }, [languageProgressResponse]);

  return (
    <div className="flex flex-col min-h-screen" id="hello-container" dir={dir}>
      <div>
        <Header
          currentUser={currentUser}
          fetchingUser={fetchingUser}
          group={group}
          round={round}
          bucket={bucket}
          ss={ss}
        />
        {children}
      </div>

      <div className="space-y-2 text-sm text-center mt-auto py-8 pb-20 text-gray-500">
        {/* NOTE TO PEOPLE WANTING TO EDIT THIS:
            Please see our license in the file /LICENSE in this repo for details on how you're allowed to change this section */}
        <div>
          <FormattedMessage
            defaultMessage="You are using <a1>Cobudget</a1>. Source code available <a2>online</a2>."
            values={{
              a1: (msg) => (
                <LinkOut href="https://cobudget.com/">{msg}</LinkOut>
              ),
              a2: (msg) => (
                <LinkOut href="https://github.com/cobudget/cobudget">
                  {msg}
                </LinkOut>
              ),
            }}
          />
        </div>
        <div className="space-x-6">
          {process.env.PRIVACY_POLICY_URL && (
            <LinkOut href="/privacy-policy">
              <FormattedMessage defaultMessage="Privacy Policy" />
            </LinkOut>
          )}
          {process.env.TERMS_URL && (
            <LinkOut href="/terms-and-conditions">
              <FormattedMessage defaultMessage="Terms and Conditions" />
            </LinkOut>
          )}
          <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
            {supportedLangs.map((option) => (
              <option key={option.value} value={option.value}>
                {languageProgressLoading || !languageProgress[option.value]
                  ? option.label
                  : option.label + " (" + languageProgress[option.value] + "%)"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Layout;
