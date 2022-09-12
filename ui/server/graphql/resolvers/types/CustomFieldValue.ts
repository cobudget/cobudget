import prisma from "../../../prisma";

export const customField = async (fieldValue) => {
  if (!fieldValue.fieldId) {
    return {
      id: "missing-" + fieldValue.id,
      name: "⚠️ Missing custom field ⚠️",
      description: "Custom field was removed",
      type: "TEXT",
      position: 1000,
      isRequired: false,
      createdAt: new Date(),
    };
  }
  const field = await prisma.fieldValue
    .findUnique({ where: { id: fieldValue.id } })
    .field();
  // const field = await prisma.field.findUnique({
  //   where: { id: fieldValue.fieldId },
  // });

  return field;
};
