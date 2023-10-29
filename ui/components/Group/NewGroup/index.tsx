import Button from "components/Button";
import PageHero from "components/PageHero";
import TextField from "components/TextField";
import { useRouter } from "next/router";
import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import { useDebounce } from "react-use";
import slugify from "../../../utils/slugify";
import { SelectField } from "components/SelectInput";

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

  const [plan, setPlan] = useState("MONTHLY");
  const [registrationPolicy, setRegistrationPolicy] = useState("OPEN");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const roundId = router.query.roundId;
  console.log("RoundId", roundId);

  const [{ data: { group } = { group: null } }, searchGroup] = useQuery({
    query: GET_GROUP_QUERY,
    variables: { groupSlug: slug },
    pause: true,
  });

  const [, cancel] = useDebounce(searchGroup, 300, [slug]);

  if (router.query.upgraded === "true") {
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
          action={`/api/stripe/create-checkout-session?mode=paidplan&plan=${plan}&groupSlug=${slug}&groupName=${name}&registrationPolicy=${registrationPolicy}&${
            roundId ? `roundId=${roundId}` : ""
          }`}
          method="POST"
        >
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
                <FormattedMessage defaultMessage="Billing period" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <PriceButton
                  heading={intl.formatMessage({
                    defaultMessage: "Monthly billing",
                  })}
                  subheading={intl.formatMessage({
                    defaultMessage: "Most flexible",
                  })}
                  price="€20"
                  period={intl.formatMessage({ defaultMessage: "month" })}
                  onClick={() => setPlan("MONTHLY")}
                  active={plan === "MONTHLY"}
                />
                <PriceButton
                  heading={intl.formatMessage({
                    defaultMessage: "Yearly billing",
                  })}
                  subheading={intl.formatMessage({
                    defaultMessage: "Best price",
                  })}
                  price="€200"
                  period={intl.formatMessage({ defaultMessage: "year" })}
                  onClick={() => setPlan("YEARLY")}
                  active={plan === "YEARLY"}
                />
              </div>
            </div>
            <Button
              type="submit"
              fullWidth
              size="large"
              disabled={!name || group || slug.length < 2 || !currentUser}
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

function PriceButton({ heading, subheading, price, period, active, onClick }) {
  return (
    <button
      type="button"
      className={
        "rounded-lg border-3 transition-colors text-left " +
        (active ? "border-black" : "border-gray-100")
      }
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">{heading}</h2>
        <p className="text-gray-600">{subheading}</p>
        <p className="text-4xl font-bold">
          {price}
          <span className="text-gray-500 font-medium text-lg">/{period}</span>
        </p>
      </div>
    </button>
  );
}
