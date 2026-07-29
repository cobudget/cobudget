import MarkdownContent from "components/MarkdownContent";

export default function EmailPreviewModal({
  open,
  onClose,
  subject,
  summary,
  message,
  recipientCount,
  roundTitle,
}: {
  open: boolean;
  onClose: () => void;
  subject: string;
  summary: string;
  message: string;
  recipientCount: number;
  roundTitle: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Email Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs text-gray-400 mb-1">
            From: Dream Team of {roundTitle}
          </div>
          <div className="text-xs text-gray-400 mb-1">
            To: {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
          </div>
          <div className="text-sm font-semibold mb-1">
            Subject: {subject || "(no subject)"}
          </div>
          {summary && (
            <div className="text-xs text-gray-500 mb-3 italic">
              {summary}
            </div>
          )}
          <div className="border-t pt-3">
            {message ? (
              <MarkdownContent
                markdown={message}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <span className="text-gray-400">(empty message)</span>
            )}
            <div
              style={{
                color: "#888",
                fontSize: "12px",
                marginTop: "24px",
                borderTop: "1px solid #eee",
                paddingTop: "12px",
              }}
            >
              This email was sent by the Dream Team of {roundTitle}.
            </div>
          </div>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="border rounded px-4 py-2 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
