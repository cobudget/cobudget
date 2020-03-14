import useForm from "react-hook-form";
import styled from "styled-components";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import Form from "../styled/Form";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";
import { DREAM_QUERY } from "../../pages/[dream]/";

const ADD_COMMENT = gql`
  mutation addComment($content: String!, $dreamId: ID!) {
    addComment(content: $content, dreamId: $dreamId) {
      id
      comments {
        content
        createdAt
        author {
          name
          avatar
        }
      }
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

const AddComment = ({ closeModal, event }) => {
  const [addComment] = useMutation(ADD_COMMENT);
  const { handleSubmit, register, errors } = useForm();

  const router = useRouter();

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { slug: router.query.dream, eventId: event.id }
    }
  );
  if (!dream) return null;

  return (
    <>
      <Container>
        <CardContainer>
          <h2>Add comment</h2>
          <Form
            onSubmit={handleSubmit(variables => {
              variables.dreamId = dream.id;
              console.log({ variables });
              addComment({ variables })
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
                name="content"
                placeholder="Comment placeholder"
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

export default AddComment;
