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
    span {
      color: red;
    }
  }

  button[type="submit"] {
    background: #10b92b;
    color: white;
    outline: none;
    border-radius: 8px;
    font-size: 20px;
    cursor: pointer;
    border-color: transparent;
    font-family: "Inter-SemiBold";
    padding: 13px 43px;
    box-shadow: 0 3px 8px rgba(44, 188, 99, 0.4);
  }

  .two-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
  }
`;

export default Form;
