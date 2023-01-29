const getStatusColor = (status: string, bucket) => {
  if (status === "PENDING_APPROVAL" && bucket.round?.requireBucketApproval)
    return "bg-app-red";
  else if (status === "PENDING_APPROVAL" && !bucket.published)
    return "bg-app-gray";
  else if (status === "IDEA" && bucket.published)
    return "bg-app-yellow";
  else if (status === "OPEN_FOR_FUNDING") return "bg-blue-600";
  else if (status === "FUNDED") return "bg-app-green";
  else if (status === "COMPLETED") return "bg-app-purple";
};

export default getStatusColor;
