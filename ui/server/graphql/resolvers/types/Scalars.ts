import { GraphQLScalarType } from "graphql";

export const BigInt = new GraphQLScalarType({
  name: "BigInt",
  description: "An integer type which also works for values greater than 32bit",
  serialize: (value) => {
    if (typeof value === "number") {
      return value + "";
    }
    return null;
  },
  parseValue: (value) => {
    console.log("Parsing...");
    if (typeof value === "string") {
      return parseInt(value);
    }
    throw new Error("Invalid value");
  },
});
