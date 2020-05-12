import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import useForm from "react-hook-form";
import styled from "styled-components";
import { Box } from "@material-ui/core";
import Card from "../components/styled/Card";
import Form from "../components/styled/Form";

const SmallCard = styled(Card)`
  max-width: 550px;
  margin: 50px auto;
  h1 {
    text-align: center;
  }
`;

const SEND_MAGIC_LINK_MUTATION = gql`
  mutation SendMagicLink($email: String!) {
    sendMagicLink(email: $email)
  }
`;

export default ({ currentUser, event }) => {
  const [sendMagicLink, { data, loading }] = useMutation(
    SEND_MAGIC_LINK_MUTATION
  );
  const { handleSubmit, register, errors } = useForm();

  if (currentUser) {
    return <Card>You are logged in as {currentUser.email}.</Card>;
  }
  let msg;
  // switch (event.registrationPolicy) {
  //   case "OPEN":
  //     msg = "Log in or sign up with a magic link";
  //     break;
  //   case "REQUEST_TO_JOIN":
  //     msg = "Log in or request to join";
  //     break;
  //   case "INVITE_ONLY":
  //     msg = "Log in with magic link";
  //     break;
  // }

  return (
    <SmallCard>
      <Box p={3}>
        <h1 className="text-2xl mb-2">{msg}</h1>

        {data && data.sendMagicLink ? (
          <div>
            {process.env.IS_PROD
              ? "Magic link sent! Check your inbox!"
              : "Find the magic link in console (in development)."}
          </div>
        ) : (
          <Form
            onSubmit={handleSubmit(({ email }) => {
              sendMagicLink({ variables: { email } });
            })}
          >
            <div className="two-cols-3-1">
              <input
                name="email"
                disabled={loading}
                placeholder="Email"
                ref={register({
                  required: "Required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "invalid email address",
                  },
                })}
              />
              <button type="submit">Send</button>
            </div>

            {errors.email && email.title.message}
          </Form>
        )}
      </Box>
    </SmallCard>
  );
};
