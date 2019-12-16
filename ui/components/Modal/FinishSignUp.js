import useForm from "react-hook-form";
import styled from "styled-components";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import Form from "../styled/Form";

const UPDATE_CURRENT_USER = gql`
  mutation updateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id
      name
      avatar
      email
    }
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardContainer = styled.div`
  max-width: 520px;
  background: white;
  border-radius: 8px;
  padding: 30px;

  h2 {
    margin: 10px 0;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.33;
  }
  p {
    color: #62676d;
    font-size: 18px;
    line-height: 1.5;
    margin-top: 8px;
  }
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }
`;

export const Button = styled.button`
  background: #0000ff;
  display: block;
  color: white;
  font-size: 14px;
  padding: 18px 22px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
  border: 0;
  cursor: pointer;
  transition: background-color 50ms ease-in-out;

  &:hover {
    background: #0000af;
  }
`;

const FinishSignUp = ({ closeModal }) => {
  const [updateUser] = useMutation(UPDATE_CURRENT_USER);
  const { handleSubmit, register, errors } = useForm();

  return (
    <>
      <Container>
        <CardContainer>
          <h2>Welcome to Dreams!</h2>
          <h2>Please choose your display name</h2>

          <Form
            onSubmit={handleSubmit(variables => {
              updateUser({ variables })
                .then(({ data }) => {
                  console.log({ data });
                  closeModal();
                })
                .catch(err => {
                  console.log({ err });
                  alert(err.message);
                });
            })}
          >
            {errors.name && errors.name.message}
            <div className="two-cols-3-1">
              <input
                name="name"
                placeholder="Good stuff"
                ref={register({
                  required: "Required"
                })}
              />
              <button type="submit">Submit</button>
            </div>
          </Form>
        </CardContainer>
      </Container>
    </>
  );
};

export default FinishSignUp;
