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

  // Use pre-included field if available (from bucketsPage optimization)
  if (fieldValue.field && typeof fieldValue.field === "object") {
    return fieldValue.field;
  }

  const field = await prisma.fieldValue
    .findUnique({ where: { id: fieldValue.id } })
    .field();

  return field;
};
