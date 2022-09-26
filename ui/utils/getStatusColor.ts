const getStatusColor = (status: string) => {
  if (status === "PENDING_APPROVAL") return "bg-app-gray";
  else if (status === "") return "bg-app-yellow";
  else if (status === "") return "bg-app-red";
  else if (status === "OPEN_FOR_FUNDING") return "bg-app-orange";
  else if (status === "FUNDED") return "bg-app-purple";
  else if (status === "COMPLETED") return "bg-app-green";
};

export default getStatusColor;
