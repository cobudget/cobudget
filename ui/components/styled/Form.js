import styled from "styled-components";
const Form = styled.form`
  input,
  textarea {
    width: 100%;
    margin: 10px 0;
    display: block;
    border-radius: 6px;
    background: #f7f8f9;
    padding: 14px;
    font-size: 20px;
    border: 3px solid #f7f8f9;
    transition: border 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:focus {
      border-color: #ffe600;
      outline: none;
    }
  }

  label {
    font-size: 18px;
  }
  .error {
  }
`;

export default Form;
