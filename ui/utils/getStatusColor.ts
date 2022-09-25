const getStatusColor = (status: string, bucket) => {
  console.log("BUCKET", bucket);
  if (status === "PENDING_APPROVAL" && bucket.round?.requireBucketApproval)
    return "bg-app-red";
  else if (status === "PENDING_APPROVAL" && !bucket.published)
    return "bg-app-gray";
  else if (status === "PENDING_APPROVAL" && bucket.published)
    return "bg-app-yellow";
  else if (status === "OPEN_FOR_FUNDING") return "bg-app-orange";
  else if (status === "FUNDED") return "bg-app-purple";
  else if (status === "COMPLETED") return "bg-app-green";
};

export default getStatusColor;
