import { useState, useMemo, useRef } from "react";
import { gql, useQuery, useMutation } from "urql";
import EmailPreviewModal from "./EmailPreviewModal";
import MarkdownContent from "components/MarkdownContent";
import Wysiwyg from "components/Wysiwyg";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const BUCKETS_QUERY = gql`
  query FreudEmailBuckets($roundId: ID!) {
    dreamReviewTable(roundId: $roundId) {
      bucket {
        id
        title
        cocreators {
          id
          user {
            id
            username
            name
          }
        }
      }
    }
  }
`;

const BATCH_EMAILS_QUERY = gql`
  query BatchEmails($roundId: ID!) {
    batchEmails(roundId: $roundId) {
      id
      subject
      summary
      message
      recipientCount
      recipients
      sentAt
      sentBy {
        id
        user {
          id
          username
          name
        }
      }
    }
  }
`;

const SEND_BATCH_EMAIL = gql`
  mutation SendBatchEmail(
    $roundId: ID!
    $subject: String!
    $summary: String
    $message: String!
    $bucketIds: [ID!]!
  ) {
    sendBatchEmail(
      roundId: $roundId
      subject: $subject
      summary: $summary
      message: $message
      bucketIds: $bucketIds
    ) {
      id
      subject
      recipientCount
    }
  }
`;

export default function EmailsPage({ round }: { round: any }) {
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");
  const [selectedBucketIds, setSelectedBucketIds] = useState<Set<string>>(
    new Set()
  );
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  const [bucketsResult] = useQuery({
    query: BUCKETS_QUERY,
    variables: { roundId: round.id },
  });
  const [emailsResult] = useQuery({
    query: BATCH_EMAILS_QUERY,
    variables: { roundId: round.id },
  });
  const [sendResult, sendBatchEmail] = useMutation(SEND_BATCH_EMAIL);

  const bucketData = bucketsResult.data?.dreamReviewTable ?? [];
  const batchEmails = emailsResult.data?.batchEmails ?? [];

  const filteredBuckets = useMemo(() => {
    if (!search) return bucketData;
    const q = search.toLowerCase();
    return bucketData.filter((d) =>
      d.bucket.title.toLowerCase().includes(q)
    );
  }, [bucketData, search]);

  const recipientCount = useMemo(() => {
    const userIds = new Set<string>();
    for (const d of bucketData) {
      if (selectedBucketIds.has(d.bucket.id)) {
        for (const cc of d.bucket.cocreators) {
          if (cc.user?.id) userIds.add(cc.user.id);
        }
      }
    }
    return userIds.size;
  }, [bucketData, selectedBucketIds]);

  const handleToggleBucket = (id: string) => {
    setSelectedBucketIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddAll = () => {
    setSelectedBucketIds(new Set(bucketData.map((d) => d.bucket.id)));
  };

  const handleClear = () => {
    setSelectedBucketIds(new Set());
  };

  const handleSend = async () => {
    setConfirmOpen(false);
    try {
      const result = await sendBatchEmail({
        roundId: round.id,
        subject,
        summary: summary || null,
        message,
        bucketIds: Array.from(selectedBucketIds),
      });
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success(
          `Email sent to ${result.data.sendBatchEmail.recipientCount} recipients`
        );
        setSubject("");
        setSummary("");
        setMessage("");
        editorRef.current?.clear();
        setSelectedBucketIds(new Set());
      }
    } catch (err) {
      toast.error("Failed to send batch email");
    }
  };

  const canSend =
    subject.trim() && message.trim() && selectedBucketIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Composer */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Email Composer</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border rounded px-3 py-2 w-full text-sm"
          />
          <input
            type="text"
            placeholder="Summary (email preview text, optional)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="border rounded px-3 py-2 w-full text-sm"
          />
          <div className="border rounded">
            <Wysiwyg
              inputRef={editorRef}
              defaultValue={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Message body..."
              highlightColor="blue"
            />
          </div>

          {/* Recipient picker */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Recipients:</span>
              <input
                type="text"
                placeholder="Search dreams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded px-2 py-1 text-xs flex-1 max-w-[200px]"
              />
              <button
                onClick={handleAddAll}
                className="text-xs text-blue-600 hover:underline"
              >
                Add All
              </button>
              <button
                onClick={handleClear}
                className="text-xs text-gray-500 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
              {filteredBuckets.map((d) => (
                <label
                  key={d.bucket.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedBucketIds.has(d.bucket.id)}
                    onChange={() => handleToggleBucket(d.bucket.id)}
                  />
                  <span className="flex-1 truncate">{d.bucket.title}</span>
                  <span className="text-xs text-gray-400">
                    {d.bucket.cocreators.length} co-creator
                    {d.bucket.cocreators.length !== 1 ? "s" : ""}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">
              {recipientCount} unique recipient{recipientCount !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewOpen(true)}
                disabled={!subject.trim() && !message.trim()}
                className="border px-4 py-2 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Preview
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                disabled={!canSend || sendResult.fetching}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
              >
                {sendResult.fetching ? "Sending..." : "Send Batch"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
            <h3 className="font-semibold mb-2">Confirm Send</h3>
            <p className="text-sm text-gray-600 mb-1">
              You are about to send an email to{" "}
              <span className="font-medium">{recipientCount}</span> recipients.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Subject: <span className="font-medium">{subject}</span>
            </p>
            <p className="text-xs text-gray-400 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="border rounded px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Send Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <EmailPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        subject={subject}
        summary={summary}
        message={message}
        recipientCount={recipientCount}
        roundTitle={round?.title ?? ""}
      />

      {/* Email History */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Email History</h3>
        {batchEmails.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-4">
            No emails sent yet
          </div>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell className="!font-semibold !text-xs !text-gray-500">Date</TableCell>
                  <TableCell className="!font-semibold !text-xs !text-gray-500">Subject</TableCell>
                  <TableCell className="!font-semibold !text-xs !text-gray-500 !text-right">Recipients</TableCell>
                  <TableCell className="!font-semibold !text-xs !text-gray-500">Sent By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batchEmails.map((email) => (
                  <>
                    <TableRow
                      key={email.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedEmailId(
                          expandedEmailId === email.id ? null : email.id
                        )
                      }
                    >
                      <TableCell className="!text-sm">
                        {dayjs(email.sentAt).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell className="!text-sm">{email.subject}</TableCell>
                      <TableCell className="!text-sm !text-right">
                        {email.recipientCount}
                      </TableCell>
                      <TableCell className="!text-sm">
                        {email.sentBy?.user?.name || email.sentBy?.user?.username}
                      </TableCell>
                    </TableRow>
                    {expandedEmailId === email.id && (
                      <TableRow key={`${email.id}-detail`}>
                        <TableCell colSpan={4} className="!bg-gray-50">
                          <div className="p-2">
                            {email.summary && (
                              <div className="text-xs text-gray-500 mb-2">
                                Preview: {email.summary}
                              </div>
                            )}
                            <MarkdownContent
                              markdown={email.message}
                              className="text-sm prose prose-sm max-w-none"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
}
