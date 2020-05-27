import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import useForm from "react-hook-form";

import { Modal } from "@material-ui/core";

import Form from "components/styled/Form";

const SEND_MAGIC_LINK_MUTATION = gql`
  mutation SendMagicLink($email: String!) {
    sendMagicLink(email: $email)
  }
`;

export default ({ open, handleClose }) => {
  const [sendMagicLink, { data, loading }] = useMutation(
    SEND_MAGIC_LINK_MUTATION
  );
  const { handleSubmit, register, errors } = useForm();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <h1 className="text-3xl font-medium mb-2">Login or sign up</h1>

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
            <p className="text-gray-800 mb-1">
              Enter your email to receive a magic link
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                className="sm:col-start-1 sm:col-end-3"
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
      </div>
    </Modal>
  );
};
