import "tippy.js/dist/tippy.css";
import "../styles.css";

import { Analytics } from "@vercel/analytics/react";
import BucketLimitOver from "components/BucketLimitOver";
import UpgradeGroupModal from "components/Elements/UpgradeGroupModal";
import Fallback from "components/Fallback";
import RequiredActionsModal from "components/RequiredActions";
import AppContext from "contexts/AppContext";
import Cookies from "js-cookie";
import { withUrqlClient } from "next-urql";
import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { IntlProvider } from "react-intl";
import { gql, useQuery } from "urql";
import reportError from "utils/reportError";
import Layout from "../components/Layout";
import { client } from "../graphql/client";
import lang, { supportedLangCodes } from "../lang";
import isRTL from "../utils/isRTL";

export const CURRENT_USER_QUERY = gql`
  query CurrentUser($roundSlug: String, $groupSlug: String) {
    currentUser {
      id
      username
      name
      avatar
      email
      acceptedTermsAt
      isSuperAdmin

      groupMemberships {
        id
        isAdmin
        group {
          id
          name
          slug
          logo
        }
      }
      roundMemberships {
        id
        isAdmin
        isApproved
        round {
          id
          title
          slug
          group {
            id
            name
            slug
            logo
          }
        }
      }
      currentCollMember(groupSlug: $groupSlug, roundSlug: $roundSlug) {
        id
        isAdmin
        isModerator
        isApproved
        isRemoved
        hasJoined
        balance
        round {
          id
          title
        }
      }
      currentGroupMember(groupSlug: $groupSlug) {
        id
        bio
        isAdmin
        discourseUsername
        hasDiscourseApiKey
      }
    }
  }
`;

export const TOP_LEVEL_QUERY = gql`
  query TopLevelQuery($roundSlug: String, $groupSlug: String, $bucketId: ID) {
    round(groupSlug: $groupSlug, roundSlug: $roundSlug) {
      id
      slug
      info
      title
      archived
      color
      currency
      registrationPolicy
      visibility
      maxAmountToBucketPerUser
      bucketCreationCloses
      bucketCreationIsOpen
      grantingOpens
      grantingCloses
      grantingIsOpen
      numberOfApprovedMembers
      about
      membersLimit {
        consumedPercentage
        currentCount
        limit
      }
      bucketsLimit {
        isLimitOver
        limit
      }
      tags {
        id
        value
      }
      allowStretchGoals
      bucketReviewIsOpen
      discourseCategoryId
      totalInMembersBalances
      ocCollective {
        slug
        parent {
          slug
        }
      }
      expenses {
        id
        ocMeta {
          legacyId
        }
        title
        amount
        ocId
        bucketId
        currency
        status
      }
      guidelines {
        id
        title
        description
        position
      }
      customFields {
        id
        name
        description
        type
        limit
        isRequired
        position
        createdAt
      }
    }
    group(groupSlug: $groupSlug) {
      __typename
      id
      name
      info
      logo
      slug
      discourseUrl
      finishedTodos
      experimentalFeatures
      registrationPolicy
      visibility
      isFree
      subscriptionStatus {
        isActive
      }
    }
    bucket(id: $bucketId) {
      id
      title
    }
  }
`;

const GET_SUPER_ADMIN_SESSION = gql`
  query GetSuperAdminSession {
    getSuperAdminSession {
      id
      duration
      start
      end
    }
  }
`;

const MyApp = ({ Component, pageProps, router }) => {
  const [{ data, fetching, error }] = useQuery({
    query: TOP_LEVEL_QUERY,
    variables: {
      groupSlug:
        process.env.SINGLE_GROUP_MODE == "true" ? "c" : router.query.group,
      roundSlug: router.query.round,
      bucketId: router.query.bucket,
    },
    pause: !router.isReady,
  });
  const [groupToUpdate, setGroupToUpdate] = useState();
  const [limitBucketOver, setLimitBucketOver] = useState<{
    isAdmin: boolean;
  }>();

  const [{ data: ssQuery }] = useQuery({ query: GET_SUPER_ADMIN_SESSION });
  const ss = ssQuery?.getSuperAdminSession;

  const [
    { data: currentUserData, fetching: fetchingUser, error: errorUser },
  ] = useQuery({
    query: CURRENT_USER_QUERY,
    variables: {
      groupSlug:
        process.env.SINGLE_GROUP_MODE == "true" ? "c" : router.query.group,
      roundSlug: router.query.round,
    },
    pause: !router.isReady,
  });

  const { round = null, group = null, bucket = null } = data ?? {};
  const currentUser = useMemo(() => {
    const { currentUser: c } = currentUserData ?? {};
    if (!c) return null;
    if (!ss) return c;
    if (c.currentCollMember && ss) {
      c.currentCollMember.isAdmin = true;
    } else if (ss) {
      c.currentCollMember = { isAdmin: true };
    }

    if (c.currentGroupMember && ss) {
      c.currentGroupMember.isAdmin = true;
    } else if (ss) {
      c.currentGroupMember = { isAdmin: true };
    }
    return c;
  }, [currentUserData, ss]);

  const [locale, setLocale] = useState(
    (() => {
      if (typeof window !== "undefined") {
        const locale = window.navigator.language;
        const langCode = locale.split("-")[0];
        if (supportedLangCodes.indexOf(langCode) > -1) {
          return langCode;
        }
      }
      return "en";
    })()
  );

  useEffect(() => {
    const locale = Cookies.get("locale");
    if (locale) {
      setLocale(locale);
    }

    // Upgrade group message
    const showUpgradeGroupMessage = (event) => {
      setGroupToUpdate(event.detail.groupId);
    };

    const showBucketLimitOver = (event) => {
      setLimitBucketOver(event.detail);
    };

    window.addEventListener(
      "show-upgrade-group-message",
      showUpgradeGroupMessage
    );

    window.addEventListener(
      "show-bucket-limit-over-popup",
      showBucketLimitOver
    );

    return () => {
      window.removeEventListener(
        "show-upgrade-group-message",
        showUpgradeGroupMessage
      );
      window.removeEventListener(
        "show-bucket-limit-over-popup",
        showBucketLimitOver
      );
    };
  }, []);

  const changeLocale = (locale) => {
    Cookies.set("locale", locale);
    setLocale(locale);
  };

  const appContext = useMemo(() => {
    return {
      ss,
    };
  }, [ss]);

  if (error) {
    console.error("Top level query failed:", error);
    return error.message;
  }

  return (
    <IntlProvider locale={locale} messages={lang[locale]}>
      <RequiredActionsModal currentUser={currentUser} />
      <ErrorBoundary
        FallbackComponent={Fallback}
        onError={(error) => reportError(error, currentUser)}
      >
        <AppContext.Provider value={appContext}>
          <Layout
            currentUser={currentUser}
            fetchingUser={fetchingUser}
            group={group}
            round={round}
            bucket={bucket}
            dir={isRTL(locale) ? "rtl" : "ltr"}
            locale={locale}
            changeLocale={changeLocale}
            ss={ss}
          >
            <Component
              {...pageProps}
              currentUser={currentUser}
              router={router}
              round={round}
              currentGroup={group}
            />
            <Analytics />
            <Toaster />
            {groupToUpdate && (
              <UpgradeGroupModal
                group={group}
                hide={() => setGroupToUpdate(undefined)}
              />
            )}
            {limitBucketOver && (
              <BucketLimitOver
                isAdmin={limitBucketOver?.isAdmin}
                hide={() => setLimitBucketOver(undefined)}
              />
            )}
          </Layout>
        </AppContext.Provider>
      </ErrorBoundary>
    </IntlProvider>
  );
};

export default withUrqlClient(client, {
  ssr: false,
})(MyApp as any);
