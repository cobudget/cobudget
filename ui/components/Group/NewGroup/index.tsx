import Button from "components/Button";
import PageHero from "components/PageHero";
import TextField from "components/TextField";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import { useDebounce } from "react-use";
import slugify from "../../../utils/slugify";
import { SelectField } from "components/SelectInput";
import {
  StripePriceSelect,
  useStripeProductPrices,
} from "components/StripePricing";

const GET_GROUP_QUERY = gql`
  query Group($groupSlug: String) {
    group(groupSlug: $groupSlug) {
      id
    }
  }
`;

export default function NewGroup({ currentUser }) {
  const router = useRouter();
  const intl = useIntl();

  const [registrationPolicy, setRegistrationPolicy] = useState("OPEN");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const roundId = router.query.roundId;
  const preSelectedPriceId = router.query.priceId as string | undefined;

  const {
    prices,
    loading: loadingPrices,
    error: priceError,
  } = useStripeProductPrices();

  const [{ data: { group } = { group: null } }, searchGroup] = useQuery({
    query: GET_GROUP_QUERY,
    variables: { groupSlug: slug },
    pause: true,
  });

  useDebounce(searchGroup, 300, [slug]);

  useEffect(() => {
    if (loadingPrices) return;

    if (!prices.length) {
      setSelectedPriceId(null);
      return;
    }

    const hasSelection =
      selectedPriceId &&
      prices.some((price) => price.id === selectedPriceId);

    if (!hasSelection) {
      const initialPriceId = preSelectedPriceId && prices.some((p) => p.id === preSelectedPriceId)
        ? preSelectedPriceId
        : (prices.find((p) => p.default) || prices[0]).id;
      setSelectedPriceId(initialPriceId);
    }
  }, [loadingPrices, prices, selectedPriceId, preSelectedPriceId]);

  // Check router.isReady before using router.query to prevent hydration mismatch
  if (router.isReady && router.query.upgraded === "true") {
    router.push(`/${router.query.group}`);
    return (
      <PageHero>
        <h1 className="text-3xl text-center">Redirecting...</h1>
      </PageHero>
    );
  }

  return (
    <>
      <PageHero className="">
        <h1 className="text-4xl text-center font-bold mb-4">
          <FormattedMessage defaultMessage="Create a Group" />
        </h1>
        <p className="text-center text-gray-600 text-xl mb-10">
          <FormattedMessage defaultMessage="Manage unlimited rounds and people in a group" />
        </p>
        <form
          action={`/api/stripe/create-checkout-session?mode=paidplan&priceId=${
            selectedPriceId ?? ""
          }&groupSlug=${slug}&groupName=${name}&registrationPolicy=${registrationPolicy}&${
            roundId ? `roundId=${roundId}` : ""
          }`}
          method="POST"
        >
          <input type="hidden" name="priceId" value={selectedPriceId ?? ""} />
          <div className="space-y-16 max-w-lg mx-auto">
            <div className="space-y-4">
              <TextField
                placeholder={intl.formatMessage({ defaultMessage: "Name" })}
                label={intl.formatMessage({ defaultMessage: "Name" })}
                autoFocus
                inputProps={{
                  value: name,
                  onChange: (e) => {
                    setName(e.target.value);
                    setSlug(slugify(e.target.value));
                  },
                }}
              />
              <TextField
                label={intl.formatMessage({ defaultMessage: "URL" })}
                error={!!group}
                helperText={intl.formatMessage({
                  defaultMessage: "URL is taken",
                })}
                inputProps={{
                  value: slug,
                  onChange: (e) => setSlug(e.target.value),
                  onBlur: (e) => setSlug(slugify(e.target.value)),
                }}
                startAdornment={process.env.DEPLOY_URL + "/"}
              />
              <SelectField
                name="registrationPolicy"
                label={intl.formatMessage({
                  defaultMessage: "Registration policy",
                })}
                className="my-4"
                inputProps={{
                  value: registrationPolicy,
                  onChange: (event) => setRegistrationPolicy(event.target.value),
                }}
              >
                <option value="OPEN">
                  {intl.formatMessage({ defaultMessage: "Open" })}
                </option>
                <option value="REQUEST_TO_JOIN">
                  {intl.formatMessage({ defaultMessage: "Request to join" })}
                </option>
                <option value="INVITE_ONLY">
                  {intl.formatMessage({ defaultMessage: "Invite only" })}
                </option>
              </SelectField>
            </div>
            <div className="">
              <label className="text-sm font-medium mb-2 block">
                <FormattedMessage defaultMessage="Subscription plan" />
              </label>
              <div className="mt-4">
                <StripePriceSelect
                  options={prices}
                  value={selectedPriceId}
                  onChange={setSelectedPriceId}
                  disabled={loadingPrices || !!priceError}
                  label={intl.formatMessage({
                    defaultMessage: "Choose a plan",
                  })}
                />
              </div>
              {loadingPrices && (
                <p className="text-sm text-gray-500 mt-2">
                  <FormattedMessage defaultMessage="Loading subscription options..." />
                </p>
              )}
              {priceError && (
                <p className="text-sm text-red-500 mt-2">
                  <FormattedMessage defaultMessage="We were unable to load the available subscription plans. Please try again later." />
                </p>
              )}
            </div>
            <Button
              type="submit"
              fullWidth
              size="large"
              disabled={
                !name ||
                group ||
                slug.length < 2 ||
                !currentUser ||
                !selectedPriceId ||
                loadingPrices ||
                !!priceError
              }
            >
              {currentUser
                ? intl.formatMessage({ defaultMessage: "Checkout" })
                : intl.formatMessage({
                    defaultMessage: "You need to be logged in",
                  })}
            </Button>
          </div>
        </form>
      </PageHero>
    </>
  );
}
